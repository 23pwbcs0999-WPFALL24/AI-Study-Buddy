// // controllers/studyRoomController.js
// const StudyRoom = require('../models/studyRoomModel');
// const Message = require('../models/messageModel');

// // Create a study room
// exports.createRoom = async (req, res, next) => {
//   try {
//     const { name } = req.body;
//     const room = await StudyRoom.create({ name, createdBy: req.user.id });
//     res.status(201).json(room);
//   } catch (err) {
//     next(err);
//   }
// };

// // Get all rooms
// exports.getRooms = async (req, res, next) => {
//   try {
//     const rooms = await StudyRoom.find().populate('createdBy', 'username email');
//     res.json(rooms);
//   } catch (err) {
//     next(err);
//   }
// };

// // Get room details
// exports.getRoomById = async (req, res, next) => {
//   try {
//     const room = await StudyRoom.findById(req.params.id)
//       .populate('createdBy', 'username email');
//     if (!room) return res.status(404).json({ message: 'Room not found' });
//     res.json(room);
//   } catch (err) {
//     next(err);
//   }
// };

// // Save chat message in DB
// exports.saveMessage = async (req, res, next) => {
//   try {
//     const { roomId, userId, username, text, type } = req.body;
//     const message = await Message.create({
//       room: roomId,
//       userId,
//       username,
//       text,
//       type
//     });
//     res.status(201).json(message);
//   } catch (err) {
//     next(err);
//   }
// };

// // Get room messages
// exports.getMessages = async (req, res, next) => {
//   try {
//     const messages = await Message.find({ room: req.params.roomId }).sort({ createdAt: 1 });
//     res.json(messages);
//   } catch (err) {
//     next(err);
//   }
// };
// controllers/studyRoomController.js
const StudyRoom = require('../models/studyRoomModel');
const Message = require('../models/messageModel');
const mongoose = require('mongoose');

// ✅ Create a study room
exports.createRoom = async (req, res, next) => {
  try {
    const { name } = req.body;
    if (!name?.trim()) {
      return res.status(400).json({ message: 'Room name required' });
    }
    const room = await StudyRoom.create({ name, createdBy: req.user?.id });
    res.status(201).json(room);
  } catch (err) {
    next(err);
  }
};

// ✅ Get all rooms
exports.getRooms = async (req, res, next) => {
  try {
    const rooms = await StudyRoom.find()
      .populate('createdBy', 'username email');
    res.json(rooms);
  } catch (err) {
    next(err);
  }
};

// ✅ Get room details
exports.getRoomById = async (req, res, next) => {
  try {
    const { id } = req.params;
    // Handle special "public-room"
    if (id === 'public-room') {
      return res.json({ _id: 'public-room', name: 'Public Room', isPublic: true });
    }
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid room ID' });
    }

    const room = await StudyRoom.findById(id)
      .populate('createdBy', 'username email');
    if (!room) return res.status(404).json({ message: 'Room not found' });
    res.json(room);
  } catch (err) {
    next(err);
  }
};

// ✅ Save chat message
exports.saveMessage = async (req, res, next) => {
  try {
    const { roomId, userId, username, message, type } = req.body;

    if (!roomId || !username || !message) {
      return res.status(400).json({ message: 'roomId, username, and message required' });
    }

    const msg = await Message.create({
      room: roomId,
      userId: userId || null,
      username,
      text: message, // 🔑 match frontend "message" field
      type: type || 'message',
    });

    res.status(201).json(msg);
  } catch (err) {
    next(err);
  }
};

// ✅ Get messages of a room
exports.getMessages = async (req, res, next) => {
  try {
    const { roomId } = req.params;

    // Handle special "public-room"
    if (roomId === 'public-room') {
      const messages = await Message.find({ room: 'public-room' }).sort({ createdAt: 1 });
      return res.json(messages);
    }

    if (!mongoose.Types.ObjectId.isValid(roomId)) {
      return res.status(400).json({ message: 'Invalid room ID' });
    }

    const messages = await Message.find({ room: roomId }).sort({ createdAt: 1 });
    res.json(messages);
  } catch (err) {
    next(err);
  }
};
