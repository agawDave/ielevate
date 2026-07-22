const { pool } = require('../config/db');
const { verifyAccessToken } = require('../config/jwt');

function registerChatHandlers(io) {
  // Auth every socket connection using the JWT access token
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      const decoded = verifyAccessToken(token);
      socket.user = decoded; // { id, uuid, role }
      next();
    } catch (err) {
      next(new Error('Unauthorized'));
    }
  });

  io.on('connection', (socket) => {
    socket.join(`user:${socket.user.id}`);

    socket.on('conversation:join', (conversationId) => {
      socket.join(`conversation:${conversationId}`);
    });

    socket.on('message:send', async ({ conversationId, body, attachmentUrl }) => {
      try {
        const [result] = await pool.query(
          `INSERT INTO messages (conversation_id, sender_id, body, attachment_url)
           VALUES (?, ?, ?, ?)`,
          [conversationId, socket.user.id, body, attachmentUrl || null]
        );

        const message = {
          id: result.insertId,
          conversationId,
          senderId: socket.user.id,
          body,
          attachmentUrl: attachmentUrl || null,
          createdAt: new Date().toISOString(),
        };

        io.to(`conversation:${conversationId}`).emit('message:new', message);
      } catch (err) {
        socket.emit('message:error', { message: 'Failed to send message' });
      }
    });

    socket.on('typing:start', ({ conversationId }) => {
      socket.to(`conversation:${conversationId}`).emit('typing:start', { userId: socket.user.id });
    });

    socket.on('typing:stop', ({ conversationId }) => {
      socket.to(`conversation:${conversationId}`).emit('typing:stop', { userId: socket.user.id });
    });

    socket.on('disconnect', () => {
      // Presence cleanup could go here
    });
  });
}

module.exports = { registerChatHandlers };
