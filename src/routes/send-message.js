const saveMessage = require('../services/save-message');

function sendMessage(io, data) {
    const { message, username, room, __createdtime__ } = data;
    saveMessage(message, username, room, __createdtime__)
        .then((response) => {
            console.log({ "messageId": response, ...data });
            io.in(room).emit('receive_message', { "messageId": response, ...data });
        })
        .catch((err) => console.log(err));
}

module.exports = sendMessage;
