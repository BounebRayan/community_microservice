const saveMessage = require('../services/save-message');
const getMessage = require('../services/get-message');
const searchMessages = require('../services/search-messages');
const auth = require('../controllers/middlewares/auth');
const leaveRoom = require('../utils/leave-room');
const reactMessage = require('../services/react-message');
const editMessage = require('../services/edit-message');
const deleteMessage = require('../services/delete-message');

const CHAT_BOT = process.env.CHAT_BOT;
let allUsers = [];
let chatRoom = '';
let rooms = []; 
// the user infos need to be changed from socket params to socket auth header token decoded values.

module.exports = (io) => {
    /*io.use(auth)*/
    io.on('connection', (socket) => {
        console.log(`User connected ${socket.id}`);

        socket.on('join_room', (data) => {
            const { username, room } = data;
            socket.join(room);
            //rooms.push({socket.decoded.userid,room});
            chatRoom = room;
            allUsers.push({ id: socket.id, username, room });
            chatRoomUsers = allUsers.filter((user) => user.room === room);
            socket.to(room).emit('chatroom_users', chatRoomUsers);
            socket.emit('chatroom_users', chatRoomUsers);

            getMessage(room)
                .then((last100Messages) => {
                    socket.emit('last_100_messages', last100Messages);
                })
                .catch((err) => console.log(err));

            let __createdtime__ = Date.now();

            socket.emit('receive_message', {
                message: `Welcome ${username}`,
                username: CHAT_BOT,
                __createdtime__,
            });

            socket.to(room).emit('receive_message', {
                message: `${username} has joined the chat room`,
                username: CHAT_BOT,
                __createdtime__,
            });

            socket.on('send_message', (data) => {
                const { message, username, room, __createdtime__ } = data;
                //io.in(room).emit('receive_message', data); 
                saveMessage(message, username, room, __createdtime__)
                  .then((response) => {console.log({"messageId":response,...data}); io.in(room).emit('receive_message', {"messageId":response,...data});  })
                  .catch((err) => console.log(err));
            });

            socket.on('edit_message', (data) => {
                const { messageId, newMessage} = data;
                editMessage(messageId, newMessage)
                  .then((response) => io.in(room).emit('edited_message', {messageId,newMessage}))
                  .catch((err) => console.log(err));
            });

            socket.on('delete_message', (data) => {
                const { messageId} = data;
                deleteMessage(messageId)
                  .then((response) => io.in(room).emit('deleted_message', data))
                  .catch((err) => console.log(err));
            });

            socket.on('react_message', async (data) => {
                const { messageId, reaction, username } = data;
                try {
                    await reactMessage(messageId, reaction, username);
                    io.in(room).emit('message_reacted', { messageId, reaction, username });
                } catch (error) {
                    socket.emit('error', 'Could not react to message');
                }
            });

            socket.on('typing', (data) => {
                const { username, room } = data;
                socket.to(room).emit('typing', username);
            });
    
            socket.on('stop_typing', (data) => {
                const { username, room } = data;
                socket.to(room).emit('stop_typing', username);
            });
        });

        socket.on('search_messages', async ({ room, searchTerm }) => {
            try {
                const results = await searchMessages(room, searchTerm);
                socket.emit('search_results', results);
            } catch (error) {
                socket.emit('error', 'Could not perform search');
            }
        });

        socket.on('leave_room', (data) => {
            const { username, room } = data;
            socket.leave(room);
            const __createdtime__ = Date.now();
            allUsers = leaveRoom(socket.id, allUsers);
            socket.to(room).emit('chatroom_users', allUsers);
            socket.to(room).emit('receive_message', {
              username: CHAT_BOT,
              message: `${username} has left the chat`,
              __createdtime__,
            });
            console.log(`${username} has left the chat`);
            // rooms = rooms.filter((data)=>data.userid != socket.decoded.userid || data.room != room);
        });

        socket.on('disconnect', () => {
            console.log('User disconnected from the chat');
            const user = allUsers.find((user) => user.id == socket.id);
            if (user?.username) {
              allUsers = leaveRoom(socket.id, allUsers);
              socket.to(chatRoom).emit('chatroom_users', allUsers);
              socket.to(chatRoom).emit('receive_message', {
                message: `${user.username} has disconnected from the chat.`,
              });
            }
        });
    });
}
