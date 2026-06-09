const dns = require('dns');
if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder('ipv4first');
}

const http = require('http');
const { Server } = require('socket.io');
const app = require('./app');
const env = require('./config/env');
const supabase = require('./config/supabase'); // verify connection

const server = http.createServer(app);

// Setup Socket.IO
const io = new Server(server, {
  cors: {
    origin: '*', // Customize this for production
    methods: ['GET', 'POST']
  }
});

// Import socket events handler
require('./socket')(io);

const PORT = env.port;

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  
  // Test DB connection conceptually (Supabase JS doesn't have a strict 'connect' method like pg, but we can log)
  console.log('Supabase client initialized.');
});
