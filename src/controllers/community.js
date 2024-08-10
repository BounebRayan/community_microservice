const saveMessage = require('../services/save-message');
const getMessage = require('../services/get-messages');
const searchMessages = require('../services/search-messages');
const auth = require('../middlewares/verifyTokenMiddleware');
const leaveRoom = require('../utils/leave-room');
const reactMessage = require('../services/react-message');
const editMessage = require('../services/edit-message');
const deleteMessage = require('../services/delete-message');
const saveUserRoom = require('../services/save-room');
const getUserRooms = require('../services/get-rooms'); 
const deleteUserRoom = require('../services/delete-room'); 

const CHAT_BOT = process.env.CHAT_BOT;
let allUsers = [];

module.exports = (io) => {
    io.use(auth);

    io.on('connection', async (socket) => {
        console.log(`User connected ${socket.id}`);

        const { user_id, username } = socket.user;
        //console.log(username);

        // Retrieve user's joined rooms from the database and join them
        try {
            const userRooms = await getUserRooms(user_id);
            //console.log(userRooms);
            socket.emit('joined_rooms', userRooms);

            if (userRooms){
            userRooms?.forEach((room) => {
                socket.join(room);
                //console.log("joined",room);
                allUsers.push({ id: socket.id, user_id, username, room });
            });}

        } catch (err) {
            console.log(err);
        }

        socket.on('join_room', async (data) => {
            const { room } = data;
            socket.join(room);
            // Save the room to the user's list in the database
            await saveUserRoom(user_id, room);
            
            allUsers.push({ id: socket.id, user_id, username, room });
            const chatRoomUsers = allUsers.filter((user) => user.room === room);
            socket.to(room).emit('chatroom_users', chatRoomUsers);
            socket.emit('chatroom_users', chatRoomUsers);
            const last100Messages = await getMessage(room);
            socket.emit('last_100_messages', {room, last100Messages});
            const createdtime = Date.now();

            socket.emit('receive_message', {
                message: `Welcome ${username}`,
                username: CHAT_BOT,
                createdtime,
            });

            socket.to(room).emit('receive_message', {
                message: `${username} has joined the chat room`,
                username: CHAT_BOT,
                createdtime,
            });

        });

        socket.on('send_message', (data) => {
            const { message, room } = data;
            //console.log(data);
            const createdtime = Date.now();
            saveMessage(user_id, message, username, room, createdtime)
                .then((response) => {
                    //console.log({ "messageId": response, ...data });
                    io.in(room).emit('receive_message', { "messageId": response, message, user_id, username, room, createdtime });
                })
                .catch((err) => console.log(err));
        });

        socket.on('edit_message', (data) => {
            const { messageId, newMessage, room} = data;
            editMessage( messageId, newMessage, user_id)
                .then(() => io.in(room).emit('edited_message', { room, messageId, newMessage }))
                .catch((err) => console.log(err));
        });

        socket.on('delete_message', (data) => {
            const { messageId, room } = data;
            deleteMessage(messageId, user_id)
                .then(() => io.in(room).emit('deleted_message', {room, messageId}))
                .catch((err) => console.log(err));
        });

        socket.on('react_message', async (data) => {
            const { messageId, reaction, room } = data;
            try {
                await reactMessage(messageId, user_id, reaction, username);
                io.in(room).emit('message_reacted', {room, messageId, reaction, username, user_id });
            } catch (error) {
                socket.emit('error', 'Could not react to message');
            }
        });

        socket.on('typing', async (room) => {
            socket.to(room).emit('typing', username);
        });

        socket.on('stop_typing', async (room) => {
            socket.to(room).emit('stop_typing', username);
        });

        // New event to load the last 100 messages for the selected room
        socket.on('load_chat', async ({room}) => {
            try {
                const last100Messages = await getMessage(room);
                socket.emit('last_100_messages', {room, last100Messages});
            } catch (err) {
                console.log(err);
                socket.emit('error', 'Could not load chat history');
            }
        });

        // New event to load the last 100 messages for the selected room
        socket.on('get_onlineUsers', async (room) => {
            try {
                const chatRoomUsers = allUsers.filter((user) => user.room === room);
                socket.to(room).emit('chatroom_users', chatRoomUsers);
                socket.emit('chatroom_users', chatRoomUsers);
                } catch (err) {
                console.log(err);
                socket.emit('error', 'Could not load online users');
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

        socket.on('leave_room', async (data) => {
            const { room } = data;
            socket.leave(room);
            const createdtime = Date.now();
            allUsers = leaveRoom(socket.id, allUsers);
            socket.to(room).emit('chatroom_users', allUsers);
            socket.to(room).emit('receive_message', {
                username: CHAT_BOT,
                message: `${username} has left the chat`,
                createdtime,
            });
            console.log(`${username} has left the chat`);

            // Remove the room from the user's list in the database
            await deleteUserRoom(user_id, room);
        });

        socket.on('disconnect', () => {
            console.log('User disconnected from the chat');
        
            // Find the user in the allUsers array
            const user = allUsers.filter((u) => u.id === socket.id);
        
            if (user) {
                // Remove the user from the allUsers array
                allUsers = allUsers.filter((u) => u.id !== socket.id);
                user.forEach((x) => {
                    socket.to(x.room).emit('chatroom_users', allUsers.filter((u) => u.room === x.room));
                });
            }
        });
        
    });
}
