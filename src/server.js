require('dotenv').config();
const express = require('express');
const cors  = require('cors');
const { Server } = require('socket.io');
http = require('http');

const controller = require('./controllers/community');

const StartServer = async () =>{
  const app = express();
  app.use(cors());
  const server = http.createServer(app);
  
  const io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  controller(io);

  server.listen(process.env.PORT, () => {
    console.log(`listening at http://localhost:${process.env.PORT}`);
  });
}

StartServer();