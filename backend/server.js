const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { createServer } = require('http');
const { Server } = require('socket.io');
const connectDB = require('./config/db');
const Message = require('./models/messageModel');

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();
const server = createServer(app);

// ✅ Allow frontend at 8000 to connect
const allowedOrigins = process.env.NODE_ENV === 'production'
  ? ['https://your-frontend-domain.com']
  : ['http://localhost:3000', 'http://localhost:8000'];

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true
  },
  transports: ['websocket', 'polling']
});

// Middleware
app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/files', require('./routes/fileRoutes'));
app.use('/api/notes', require('./routes/notesRoutes'));
app.use('/api/ai', require('./routes/aiRoutes'));
app.use('/api/progress', require('./routes/progressRoutes'));
app.use('/api/studyrooms', require('./routes/studyRoomRoutes'));

// ✅ Socket.IO events
io.on('connection', (socket) => {
  console.log('✅ User connected:', socket.id);

  // Join study room
  socket.on('join-room', (roomId, userId, username) => {
    socket.join(roomId);
    io.to(roomId).emit('user-joined', {
      userId,
      username,
      socketId: socket.id,
      type: 'join',
      message: `${username} joined the study room`,
      timestamp: new Date().toISOString()
    });
    console.log(`➡️ ${username} (${userId}) joined room ${roomId}`);
  });

  // Leave study room
  socket.on('leave-room', (roomId, userId, username) => {
    socket.leave(roomId);
    io.to(roomId).emit('user-left', {
      userId,
      username,
      socketId: socket.id,
      type: 'leave',
      message: `${username} left the study room`,
      timestamp: new Date().toISOString()
    });
    console.log(`⬅️ ${username} (${userId}) left room ${roomId}`);
  });

  // Chat messages
  socket.on('chat-message', async (data) => {
    const payload = {
      roomId: data.roomId,
      userId: data.userId,
      username: data.username,
      message: data.message,
      type: data.type || 'message',
      timestamp: new Date().toISOString(),
      // 👇 only focus sessions will have these
      duration: data.duration || null,
      startTime: data.startTime || null
    };

    io.to(data.roomId).emit('chat-message', payload);

    if (['message', 'focus'].includes(payload.type)) {
      try {
        await Message.create({
          room: payload.roomId,
          userId: payload.userId,
          username: payload.username,
          text: payload.message,
          type: payload.type,
          ...(payload.type === 'focus' && {
            duration: payload.duration,
            startTime: payload.startTime
          })
        });
      } catch (err) {
        console.error('❌ Error saving message:', err);
      }
    }
  });

  // 📌 Study sessions (NEW)
  socket.on("start-session", ({ roomId, sessionType, duration }) => {
    const endTime = Date.now() + duration * 1000; // duration in seconds
    io.to(roomId).emit("session-started", {
      sessionType,
      duration,
      endTime
    });
    console.log(`⏳ ${sessionType} session started in room ${roomId} for ${duration}s`);
  });

  // Note sharing
  socket.on('share-note', (data) => {
    io.to(data.roomId).emit('shared-note', {
      noteId: data.noteId,
      noteTitle: data.noteTitle,
      noteContent: data.noteContent,
      sharedBy: data.userId,
      timestamp: new Date().toISOString()
    });
  });

  // Quiz sharing
  socket.on('share-quiz', (data) => {
    io.to(data.roomId).emit('shared-quiz', {
      quiz: data.quiz,
      sharedBy: data.userId,
      timestamp: new Date().toISOString()
    });
  });

  // Disconnect
  socket.on('disconnect', () => {
    console.log('❌ User disconnected:', socket.id);
  });
});

// Error middleware
app.use(require('./middlewares/errorMiddleware'));

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    message: '✅ AI Study Buddy Server is running!',
    timestamp: new Date().toISOString()
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
});

module.exports = { app, io };
