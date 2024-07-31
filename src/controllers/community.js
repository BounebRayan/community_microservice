
const saveMessage = require('../services/save-message');
const getMessage = require('../services/get-message');
const leaveRoom = require('../utils/leave-room');
const auth = require('../controllers/middlewares/auth');
const CHAT_BOT = process.env.CHAT_BOT;
let allUsers = [];

module.exports = (io) => {
    // Connection established
    io.use(auth).on('connection', (socket) => {
        console.log(`User connected ${socket.id}`);

        // join_room event emit from client-frontend 
        socket.on('join_room', (data) => {
            // data will include user's info name, lastname, pic_url, user_id/profile_url, region? sockey.decoded for the token infos
            // room is a string variable. A user may selected one from list of selected rooms in the frontend.
            const { username, room } = data;
            socket.join(room);
            
            // add the user to the list of all users across all rooms
            allUsers.push({ id: socket.id, username, room });
            // get users by current room
            chatRoomUsers = allUsers.filter((user) => user.room === room);
            // forward the list of room users to all other users within the room
            socket.to(room).emit('chatroom_users', chatRoomUsers);
            // forward the list of room users to the current user
            socket.emit('chatroom_users', chatRoomUsers);

            getMessage(room)
                .then((last100Messages) => {
                    socket.emit('last_100_messages', last100Messages);
                })
                .catch((err) => console.log(err));


            let __createdtime__ = Date.now();
          
            // Send message to the user
            socket.emit('receive_message', {
                message: `Welcome ${username}`,
                username: CHAT_BOT,
                __createdtime__,
            });

            // Send message to all users currently in the room, apart from the user that just joined
            socket.to(room).emit('receive_message', {
                message: `${username} has joined the chat room`,
                username: CHAT_BOT,
                __createdtime__,
            });

            // When current user sends a message
            socket.on('send_message', (data) => {
                const { message, username, room, __createdtime__ } = data;
                // Send to all users in room, including sender (io not socket used)
                io.in(room).emit('receive_message', data); 
                // Save message in db
                saveMessage(message, username, room, __createdtime__) 
                  .then((response) => console.log(response))
                  .catch((err) => console.log(err));
            });
        });

        socket.on('leave_room', (data) => {
            const { username, room } = data;
            socket.leave(room);
            const __createdtime__ = Date.now();
            // Remove user from memory
            allUsers = leaveRoom(socket.id, allUsers);
            socket.to(room).emit('chatroom_users', allUsers);
            socket.to(room).emit('receive_message', {
              username: CHAT_BOT,
              message: `${username} has left the chat`,
              __createdtime__,
            });
            console.log(`${username} has left the chat`);
        });

        socket.on('disconnect', () => {
            console.log('User disconnected from the chat');
            const user = allUsers.find((user) => user.id == socket.id);
            if (user?.username) {
              allUsers = leaveRoom(socket.id, allUsers);
              socket.to(room).emit('chatroom_users', allUsers);
              socket.to(room).emit('receive_message', {
                message: `${user.username} has disconnected from the chat.`,
              });
            }
        });
    });
}