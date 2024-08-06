const joinRoom = require('../routes/join-room');
const sendMessage = require('../routes/send-message');
const editMessage = require('../routes/edit-message');
const deleteMessage = require('../routes/delete-message');
const reactMessage = require('../routes/react-message');
const typing = require('../routes/typing');
const stopTyping = require('../routes/stop-typing');
const searchMessages = require('../routes/search-message');
const leaveRoom = require('../routes/leave-room');
const disconnect = require('../routes/disconnect');

module.exports = (io) => {
    // Connection established
    /*io.use(auth)*/
    io.on('connection', (socket) => {
        console.log(`User connected ${socket.id}`);

        socket.on('join_room', (data) => joinRoom(socket, data));

        socket.on('send_message', (data) => sendMessage(io, data));

        socket.on('edit_message', (data) => editMessage(io, data));

        socket.on('delete_message', (data) => deleteMessage(io, data));

        socket.on('react_message', (data) => reactMessage(io, data));

        socket.on('typing', (data) => typing(socket, data));

        socket.on('stop_typing', (data) => stopTyping(socket, data));

        socket.on('search_messages', (data) => searchMessages(socket, data));

        socket.on('leave_room', (data) => leaveRoom(socket, data));

        socket.on('disconnect', () => disconnect(socket));
    });
};
