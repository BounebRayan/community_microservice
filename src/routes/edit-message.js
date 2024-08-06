const editMessageService = require('../services/edit-message');

function editMessage(io, data) {
    const { messageId, newMessage } = data;
    editMessageService(messageId, newMessage)
        .then((response) => {
            io.in(data.room).emit('edited_message', { messageId, newMessage });
        })
        .catch((err) => console.log(err));
}

module.exports = editMessage;
