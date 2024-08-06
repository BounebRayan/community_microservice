const leaveRoomUtil = require('../utils/leave-room');
const state = require('../utils/state');

const CHAT_BOT = process.env.CHAT_BOT;

function disconnect(socket) {
    console.log('User disconnected from the chat');
    let allUsers = state.getAllUsers();
    const user = allUsers.find((user) => user.id === socket.id);
    if (user?.username) {
        allUsers = leaveRoomUtil(socket.id, allUsers);
        state.setAllUsers(allUsers);
        socket.to(state.getChatRoom()).emit('chatroom_users', allUsers);
        socket.to(state.getChatRoom()).emit('receive_message', {
            message: `${user.username} has disconnected from the chat.`,
        });
    }
}

module.exports = disconnect;
