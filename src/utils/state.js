let allUsers = [];
let chatRoom = '';

function getAllUsers() {
    return allUsers;
}

function setAllUsers(users) {
    allUsers = users;
}

function getChatRoom() {
    return chatRoom;
}

function setChatRoom(room) {
    chatRoom = room;
}

module.exports = {
    getAllUsers,
    setAllUsers,
    getChatRoom,
    setChatRoom,
};
