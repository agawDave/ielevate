const http = require('http');
const app = require('./app');
const { initSockets } = require('./sockets');
const { testConnection } = require('./config/db');

const PORT = process.env.PORT || 5000;

const httpServer = http.createServer(app);
initSockets(httpServer);

async function start() {
  try {
    await testConnection();
    console.log('MySQL connection OK');
  } catch (err) {
    console.error('Failed to connect to MySQL:', err.message);
    process.exit(1);
  }

  httpServer.listen(PORT, () => {
    console.log(`iElevate API + Socket.io listening on port ${PORT}`);
  });
}

start();
