const express = require('express');
const cors  = require('cors');
http = require('http');
const { Server } = require('socket.io');

const app = express();
app.use(cors());
const server = http.createServer(app);
const port = 4000;

const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
});
const CHAT_BOT = 'ChatBot';
let chatRoom = '';
let allUsers = [];
io.on('connection', (socket) => {
  console.log(`User connected ${socket.id}`);
  

  // Add a user to a room
  socket.on('join_room', (data) => {
    const { username, room } = data; // Data sent from client when join_room event emitted
    socket.join(room); // Join the user to a socket room
    
    
    socket.emit('receive_message', {
      message: `Welcome ${username}`,
      username: CHAT_BOT,
      __createdtime__,
    });
    chatRoom = room;
    allUsers.push({ id: socket.id, username, room });
    chatRoomUsers = allUsers.filter((user) => user.room === room);
    socket.to(room).emit('chatroom_users', chatRoomUsers);
    socket.emit('chatroom_users', chatRoomUsers);
    // Add this
    let __createdtime__ = Date.now(); // Current timestamp
    // Send message to all users currently in the room, apart from the user that just joined
    socket.to(room).emit('receive_message', {
      message: `${username} has joined the chat room`,
      username: CHAT_BOT,
      __createdtime__,
    });
  });
});

server.listen(port, () => {
  console.log(`listening at http://localhost:${port}`);
});