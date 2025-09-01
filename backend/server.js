const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { createServer } = require("http");
const { Server } = require("socket.io");
const connectDB = require("./config/db");
const Message = require("./models/messageModel");

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();
const server = createServer(app);

// ✅ Allowed origins
const allowedOrigins =
  process.env.NODE_ENV === "production"
    ? ["https://your-frontend-domain.com"]
    : ["http://localhost:3000", "http://localhost:8000"];

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  },
  transports: ["websocket", "polling"],
});

// 🔥 In-memory state
const activeSessions = {}; // { roomId: { sessionId, sessionName, duration, endTime, startedBy } }
const activeUsers = {}; // { roomId: [ { userId, username, socketId } ] }

// Middleware
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/files", require("./routes/fileRoutes"));
app.use("/api/notes", require("./routes/notesRoutes"));
app.use("/api/ai", require("./routes/aiRoutes"));
app.use("/api/progress", require("./routes/progressRoutes"));
app.use("/api/studyrooms", require("./routes/studyRoomRoutes"));

// ================== SOCKET EVENTS ==================
io.on("connection", (socket) => {
  console.log("✅ User connected:", socket.id);

  // --- Join Room ---
  socket.on("join-room", ({ roomId, userId, username }) => {
    if (!roomId || !userId) return;

    socket.join(roomId);

    // Track user
    if (!activeUsers[roomId]) activeUsers[roomId] = [];
    if (!activeUsers[roomId].some((u) => u.userId === userId)) {
      activeUsers[roomId].push({ userId, username, socketId: socket.id });
    }

    // Sync active users to everyone
    io.to(roomId).emit("active-users", activeUsers[roomId]);

    // Broadcast chat join message
    const joinMsg = {
      roomId,
      userId,
      username,
      type: "join",
      text: `${username} joined the study room`,
      timestamp: new Date().toISOString(),
    };
    io.to(roomId).emit("chat-message", joinMsg);

    console.log(`➡️ ${username} (${userId}) joined room ${roomId}`);

    // Sync active session if exists
    if (activeSessions[roomId]) {
      io.to(socket.id).emit("session-started", activeSessions[roomId]);
    }
  });

  // --- Leave Room ---
  socket.on("leave-room", ({ roomId, userId, username }) => {
    socket.leave(roomId);

    if (activeUsers[roomId]) {
      activeUsers[roomId] = activeUsers[roomId].filter((u) => u.userId !== userId);
      io.to(roomId).emit("active-users", activeUsers[roomId]);
    }

    const leaveMsg = {
      roomId,
      userId,
      username,
      type: "leave",
      text: `${username} left the study room`,
      timestamp: new Date().toISOString(),
    };
    io.to(roomId).emit("chat-message", leaveMsg);

    console.log(`⬅️ ${username} (${userId}) left room ${roomId}`);
  });

  // --- Chat Messages ---
  socket.on("chat-message", async (data) => {
    if (!data?.roomId || !data?.userId) return;

    const payload = {
      roomId: data.roomId,
      userId: data.userId,
      username: data.username,
      text: data.message, // unified field
      type: data.type || "message",
      timestamp: new Date().toISOString(),
      duration: data.duration || null,
      startTime: data.startTime || null,
    };

    io.to(data.roomId).emit("chat-message", payload);

    // Save only actual chat/focus messages
    if (["message", "focus"].includes(payload.type)) {
      try {
        await Message.create({
          room: payload.roomId,
          userId: payload.userId,
          username: payload.username,
          text: payload.text,
          type: payload.type,
          ...(payload.type === "focus" && {
            duration: payload.duration,
            startTime: payload.startTime,
          }),
        });
      } catch (err) {
        console.error("❌ Error saving message:", err.message);
      }
    }
  });

  // --- Start Session ---
  socket.on("start-session", ({ roomId, sessionId, sessionName, duration, startedBy }) => {
    if (!roomId || !sessionId) return;

    const endTime = Date.now() + duration * 1000;

    activeSessions[roomId] = {
      sessionId,
      sessionName,
      duration,
      endTime,
      startedBy,
    };

    // Broadcast session start
    io.to(roomId).emit("session-started", activeSessions[roomId]);

    // Add system chat
    const sessionMsg = {
      roomId,
      userId: socket.id,
      username: startedBy,
      text: `${startedBy} started a ${sessionName} session`,
      type: "focus",
      timestamp: new Date().toISOString(),
      duration,
      startTime: Date.now(),
    };
    io.to(roomId).emit("chat-message", sessionMsg);

    console.log(`⏳ ${startedBy} started "${sessionName}" in room ${roomId}`);
  });

  // --- Stop Session ---
  socket.on("stop-session", ({ roomId, stoppedBy }) => {
    if (!roomId) return;

    delete activeSessions[roomId];
    io.to(roomId).emit("session-stopped");

    const stopMsg = {
      roomId,
      userId: socket.id,
      username: stoppedBy,
      text: `${stoppedBy} stopped the study session`,
      type: "focus",
      timestamp: new Date().toISOString(),
    };
    io.to(roomId).emit("chat-message", stopMsg);

    console.log(`🛑 ${stoppedBy} stopped session in room ${roomId}`);
  });

  // --- Share Note ---
  socket.on("share-note", (data) => {
    if (!data?.roomId) return;
    io.to(data.roomId).emit("shared-note", {
      noteId: data.noteId,
      noteTitle: data.noteTitle,
      noteContent: data.noteContent,
      sharedBy: data.userId,
      timestamp: new Date().toISOString(),
    });
  });

  // --- Share Quiz ---
  socket.on("share-quiz", (data) => {
    if (!data?.roomId) return;
    io.to(data.roomId).emit("shared-quiz", {
      quiz: data.quiz,
      sharedBy: data.userId,
      timestamp: new Date().toISOString(),
    });
  });

  // --- Disconnect Cleanup ---
  socket.on("disconnect", () => {
    for (const roomId in activeUsers) {
      const user = activeUsers[roomId]?.find((u) => u.socketId === socket.id);
      if (user) {
        activeUsers[roomId] = activeUsers[roomId].filter((u) => u.socketId !== socket.id);
        io.to(roomId).emit("active-users", activeUsers[roomId]);

        const leaveMsg = {
          roomId,
          userId: user.userId,
          username: user.username,
          type: "leave",
          text: `${user.username} left the study room`,
          timestamp: new Date().toISOString(),
        };
        io.to(roomId).emit("chat-message", leaveMsg);
      }
    }
    console.log("❌ User disconnected:", socket.id);
  });
});

// ====================================================

// Error middleware
app.use(require("./middlewares/errorMiddleware"));

// Health check
app.get("/api/health", (req, res) => {
  res.status(200).json({
    message: "✅ AI Study Buddy Server is running!",
    timestamp: new Date().toISOString(),
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
});

module.exports = { app, io };
