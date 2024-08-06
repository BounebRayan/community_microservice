const getMessage = require('../services/get-message');
const state = require('../utils/state');

const CHAT_BOT = process.env.CHAT_BOT;

function joinRoom(socket, data) {
    const { username, room } = data;
    socket.join(room);
    state.setChatRoom(room);
    let allUsers = state.getAllUsers();
    allUsers.push({ id: socket.id, username, room });
    state.setAllUsers(allUsers);
    const chatRoomUsers = allUsers.filter((user) => user.room === room);
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
}

module.exports = joinRoom;
