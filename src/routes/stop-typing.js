function stopTyping(socket, data) {
    const { username, room } = data;
    socket.to(room).emit('stop_typing', username);
}

module.exports = stopTyping;
