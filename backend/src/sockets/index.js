const { Server } = require('socket.io');
const { registerChatHandlers } = require('./chatHandler');

function initSockets(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      credentials: true,
    },
  });

  registerChatHandlers(io);

  return io;
}

module.exports = { initSockets };
