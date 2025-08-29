const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { createServer } = require('http');
const { Server } = require('socket.io');
const connectDB = require('./config/db');
const Message = require('./models/messageModel'); // Add this at the top

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();
const server = createServer(app);

// Socket.IO setup
const io = new Server(server, {
  cors: {
    origin: process.env.NODE_ENV === 'production' 
      ? ['https://your-frontend-domain.com'] 
      : ['http://localhost:3000', 'http://localhost:8000'],
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-frontend-domain.com'] 
    : ['http://localhost:3000', 'http://localhost:8000'],
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

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

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
    console.log(`User ${userId} joined room ${roomId}`);
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
    console.log(`User ${userId} left room ${roomId}`);
  });

  // Handle chat messages (including join/leave/focus)
  socket.on('chat-message', async (data) => {
    const payload = {
      roomId: data.roomId,
      userId: data.userId,
      username: data.username,
      message: data.message,
      type: data.type || 'message',
      timestamp: new Date().toISOString()
    };
    io.to(data.roomId).emit('chat-message', payload);

    // Save to DB if it's a normal message or focus event
    if (['message', 'focus'].includes(payload.type)) {
      try {
        await Message.create({
          room: payload.roomId,
          userId: payload.userId,
          username: payload.username,
          text: payload.message,
          type: payload.type
        });
      } catch (err) {
        console.error('Error saving message:', err);
      }
    }
  });

  // Handle note sharing
  socket.on('share-note', (data) => {
    io.to(data.roomId).emit('shared-note', {
      noteId: data.noteId,
      noteTitle: data.noteTitle,
      noteContent: data.noteContent,
      sharedBy: data.userId,
      timestamp: new Date().toISOString()
    });
  });

  // Handle quiz sharing
  socket.on('share-quiz', (data) => {
    io.to(data.roomId).emit('shared-quiz', {
      quiz: data.quiz,
      sharedBy: data.userId,
      timestamp: new Date().toISOString()
    });
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Error handling middleware
app.use(require('./middlewares/errorMiddleware'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    message: 'AI Study Buddy Server is running!',
    timestamp: new Date().toISOString()
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
});

module.exports = { app, io };
