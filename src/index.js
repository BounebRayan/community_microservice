require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Server } = require('socket.io');
const http = require('http');

const controller = require('./controllers/community');

const StartServer = async () => {
  const app = express();
  app.use(cors());

  // Define a simple route for the root URL
  app.get('/', (req, res) => {
    res.send('Hello, World!');
  });

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
