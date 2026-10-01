const jwt = require('jsonwebtoken');
const Message = require('../models/Message');
const Room = require('../models/Room');
const User = require('../models/User');

module.exports = (io) => {

  // Authenticate every socket connection with JWT
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error('Not authorized'));
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      next();
    } catch {
      next(new Error('Token invalid'));
    }
  });

  io.on('connection', async (socket) => {
    console.log(`User connected: ${socket.userId}`);

    // Mark user as online
    await User.findByIdAndUpdate(socket.userId, { isOnline: true });

    // Join a chat room
    socket.on('join_room', (roomId) => {
      socket.join(roomId);
      console.log(`User ${socket.userId} joined room ${roomId}`);
    });

    // Leave a chat room
    socket.on('leave_room', (roomId) => {
      socket.leave(roomId);
      console.log(`User ${socket.userId} left room ${roomId}`);
    });

    // Send a message
    socket.on('send_message', async (data) => {
      try {
        // data: { roomId, content, type, mediaUrl, altText }
        const message = await Message.create({
          room: data.roomId,
          sender: socket.userId,
          content: data.content,
          type: data.type || 'text',
          mediaUrl: data.mediaUrl || null,
          altText: data.altText || null
        });

        // Update last message in room
        await Room.findByIdAndUpdate(data.roomId, {
          lastMessage: message._id
        });

        // Populate sender info before sending
        const populated = await message.populate(
          'sender', 'name avatar disabilityType'
        );

        // Broadcast to everyone in the room
        io.to(data.roomId).emit('receive_message', populated);

      } catch (err) {
        socket.emit('error', { message: err.message });
      }
    });

    // Typing indicator
    socket.on('typing', ({ roomId, isTyping }) => {
      socket.to(roomId).emit('user_typing', {
        userId: socket.userId,
        isTyping
      });
    });

    // SOS emergency alert
    socket.on('sos', ({ roomId, location }) => {
      io.to(roomId).emit('sos_alert', {
        userId: socket.userId,
        location,
        time: new Date()
      });
    });

    // Mark messages as read
    socket.on('mark_read', async ({ roomId }) => {
      try {
        await Message.updateMany(
          { room: roomId, readBy: { $ne: socket.userId } },
          { $push: { readBy: socket.userId } }
        );
        socket.to(roomId).emit('messages_read', { userId: socket.userId });
      } catch (err) {
        socket.emit('error', { message: err.message });
      }
    });

    // Handle disconnect
    socket.on('disconnect', async () => {
      console.log(`User disconnected: ${socket.userId}`);
      await User.findByIdAndUpdate(socket.userId, {
        isOnline: false,
        lastSeen: new Date()
      });
    });
  });
};