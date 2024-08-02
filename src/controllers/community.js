const saveMessage = require('../services/save-message');
const getMessage = require('../services/get-message');
const searchMessages = require('../services/search-messages'); // New service for searching messages
const leaveRoom = require('../utils/leave-room');
const CHAT_BOT = process.env.CHAT_BOT;
let allUsers = [];
let chatRoom = '';
let rooms = []; // this is for keeping track of a users joined rooms even if when disconnects save to db

module.exports = (io) => {
    // Connection established
    io.on('connection', (socket) => {
        console.log(`User connected ${socket.id}`);

        // User joins a room
        socket.on('join_room', (data) => {
            const { username, room } = data;
            socket.join(room);
            chatRoom = room;
            allUsers.push({ id: socket.id, username, room });
            chatRoomUsers = allUsers.filter((user) => user.room === room);
            socket.to(room).emit('chatroom_users', chatRoomUsers);
            socket.emit('chatroom_users', chatRoomUsers);

            // Fetch last 100 messages for the room
            getMessage(room)
                .then((last100Messages) => {
                    socket.emit('last_100_messages', last100Messages);
                })
                .catch((err) => console.log(err));

            let __createdtime__ = Date.now();

            // Welcome message from chat bot
            socket.emit('receive_message', {
                message: `Welcome ${username}`,
                username: CHAT_BOT,
                __createdtime__,
            });

            // Notify others in the room
            socket.to(room).emit('receive_message', {
                message: `${username} has joined the chat room`,
                username: CHAT_BOT,
                __createdtime__,
            });

            // Handle sending messages
            socket.on('send_message', (data) => {
                const { message, username, room, __createdtime__ } = data;
                io.in(room).emit('receive_message', data); 
                saveMessage(message, username, room, __createdtime__)
                  .then((response) => console.log(response))
                  .catch((err) => console.log(err));
            });
        });

        // User leaves a room
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

        // User disconnects
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

        // Search messages in a room
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
        socket.on('edit_message', async (data) => {
            const { messageId, newMessage, room } = data;
            try {
                await editMessage(messageId, newMessage);
                io.in(room).emit('message_edited', { messageId, newMessage });
            } catch (error) {
                socket.emit('error', 'Could not edit message');
            }
        });
        
    });
}
