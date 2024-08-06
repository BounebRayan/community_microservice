const deleteMessageService = require('../services/delete-message');

function deleteMessage(io, data) {
    const { messageId } = data;
    deleteMessageService(messageId)
        .then((response) => {
            io.in(data.room).emit('deleted_message', data);
        })
        .catch((err) => console.log(err));
}

module.exports = deleteMessage;
