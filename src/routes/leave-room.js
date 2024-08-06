const leaveRoomUtil = require('../utils/leave-room');
const state = require('../utils/state');

const CHAT_BOT = process.env.CHAT_BOT;

function leaveRoom(socket, data) {
    const { username, room } = data;
    socket.leave(room);
    const __createdtime__ = Date.now();
    let allUsers = state.getAllUsers();
    allUsers = leaveRoomUtil(socket.id, allUsers);
    state.setAllUsers(allUsers);
    socket.to(room).emit('chatroom_users', allUsers);
    socket.to(room).emit('receive_message', {
        username: CHAT_BOT,
        message: `${username} has left the chat`,
        __createdtime__,
    });
    console.log(`${username} has left the chat`);
}

module.exports = leaveRoom;
