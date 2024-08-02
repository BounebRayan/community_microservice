const saveMessage = require('../services/save-message');
const getMessage = require('../services/get-message');
const searchMessages = require('../services/search-messages');
const leaveRoom = require('../utils/leave-room');
const reactMessage = require('../services/react-message');

const CHAT_BOT = process.env.CHAT_BOT;
let allUsers = [];
let chatRoom = '';
let rooms = []; 
let onlineUsers = {}; // Track online users

module.exports = (io) => {
    io.on('connection', (socket) => {
        console.log(`User connected ${socket.id}`);

        socket.on('join_room', (data) => {
            const { username, room } = data;
            socket.join(room);
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
                io.in(room).emit('receive_message', data); 
                saveMessage(message, username, room, __createdtime__)
                  .then((response) => console.log(response))
                  .catch((err) => console.log(err));
            });
            socket.on('react_message', async (data) => {
                const { messageId, reaction, username, room } = data;
                try {
                    await reactMessage(messageId, reaction, username);
                    io.in(room).emit('message_reacted', { messageId, reaction, username });
                } catch (error) {
                    socket.emit('error', 'Could not react to message');
                }
            });
            // Track user presence
            socket.on('user_online', (data) => {
                const { username, userId } = data;
                onlineUsers[userId] = { username, socketId: socket.id };
                io.emit('online_users', onlineUsers);
            });

            socket.on('disconnect', () => {
                for (const userId in onlineUsers) {
                    if (onlineUsers[userId].socketId === socket.id) {
                        delete onlineUsers[userId];
                    }
                }
                io.emit('online_users', onlineUsers);
            });
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

        socket.on('search_messages', async ({ room, searchTerm }) => {
            try {
                const results = await searchMessages(room, searchTerm);
                socket.emit('search_results', results);
            } catch (error) {
                socket.emit('error', 'Could not perform search');
            }
        });

        socket.on('typing', (room) => {
            socket.to(room).emit('typing', socket.id);
        });

        socket.on('stop_typing', (room) => {
            socket.to(room).emit('stop_typing', socket.id);
        });
    });
}
