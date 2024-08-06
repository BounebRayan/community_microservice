const reactMessageService = require('../services/react-message');

async function reactMessage(io, data) {
    const { messageId, reaction, username } = data;
    try {
        await reactMessageService(messageId, reaction, username);
        io.in(data.room).emit('message_reacted', { messageId, reaction, username });
    } catch (error) {
        socket.emit('error', 'Could not react to message');
    }
}

module.exports = reactMessage;
