function typing(socket, data) {
    const { username, room } = data;
    socket.to(room).emit('typing', username);
}

module.exports = typing;
