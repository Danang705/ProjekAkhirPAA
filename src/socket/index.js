const chatService = require('../services/chat.service');
const notificationService = require('../services/notification.service');
const supabase = require('../config/supabase');
const { verifyToken } = require('../utils/jwt.util');

module.exports = (io) => {
  // Authentication middleware for socket
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication error: Token missing'));
    }
    const decoded = verifyToken(token);
    if (!decoded) {
      return next(new Error('Authentication error: Invalid token'));
    }
    socket.user = decoded;
    next();
  });

  io.on('connection', (socket) => {
    console.log(`User connected to socket: ${socket.user.name || socket.user.email} (${socket.id})`);

    // Join a specific chat room
    socket.on('join_room', (roomId) => {
      socket.join(roomId);
      console.log(`User ${socket.user.email} joined room: ${roomId}`);
    });

    // Handle text/image messages
    socket.on('send_message', async (data) => {
      try {
        const { roomId, content, type } = data; // type: 'text', 'image'
        const senderId = socket.user.id;

        // Save to DB
        const savedMessage = await chatService.saveMessage(roomId, senderId, content, type);

        // Broadcast to everyone in the room
        io.to(roomId).emit('receive_message', savedMessage);

        // ── FCM: Kirim push notification ke lawan bicara ─────────────────────
        try {
          const chatData = await chatService.getChatParticipants(roomId);
          if (chatData) {
            const recipientId =
              chatData.user1_id === senderId ? chatData.user2_id : chatData.user1_id;

            const { data: senderData } = await supabase
              .from('users')
              .select('name')
              .eq('id', senderId)
              .single();

            await notificationService.notifyNewChatMessage(
              recipientId,
              senderData?.name || 'Seseorang',
              content,
              roomId,
              type
            );
          }
        } catch (notifErr) {
          console.error('[FCM] Failed to send chat notification:', notifErr.message);
        }
        // ──────────────────────────────────────────────────────────────────────
      } catch (error) {
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Handle live location sharing
    socket.on('send_location', async (data) => {
      try {
        const { roomId, lat, lng } = data;
        const senderId = socket.user.id;
        
        const content = JSON.stringify({ lat, lng });

        // Save to DB (Optional: or you can just emit it without saving if it's pure "live" tracking)
        // Here we save it as a 'location' type message
        const savedMessage = await chatService.saveMessage(roomId, senderId, content, 'location');

        // Broadcast to room
        io.to(roomId).emit('receive_location', savedMessage);
      } catch (error) {
        socket.emit('error', { message: 'Failed to send location' });
      }
    });

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.id}`);
    });
  });
};
