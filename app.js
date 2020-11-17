const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const app = express();
const server = http.createServer(app);
const io = socketio(server);
const port = 3000;

server.listen(3001, () => {
  console.log(`server running on port:${3001}`);
});

let list = [];

io.on('connection', (socket) => {
  const { channelId } = socket.handshake.query;
  socket.join(channelId);
  socket.on('add', async (msg) => {
    list.push(msg);
    list.sort((a, b)=> b.updated_at - a.updated_at);
    io.to(channelId).emit('chat', list);
  });
  socket.on('update', async (msg) => {
    const index = list.findIndex((item) => item.id === msg.id);
    if (index >= 0) {
      list[index] = msg;
      list.sort((a, b)=> b.updated_at - a.updated_at);
      io.to(channelId).emit('chat', list);
    }
  });
  socket.on('delete', async (msg) => {
    const filterList = list.filter((item) => item.id !== msg.id);
    list = [...filterList];
    io.to(channelId).emit('chat', list);
  });
});

app.get('/', (req, res) => {
  const reverse = [...list];
  res.status(200).send({ list: reverse.reverse() });
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})