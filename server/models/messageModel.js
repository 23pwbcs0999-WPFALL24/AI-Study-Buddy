const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  room: { type: mongoose.Schema.Types.ObjectId, ref: 'StudyRoom' },
  userId: { type: String }, // socket userId or user._id if logged in
  username: { type: String },
  text: { type: String },
  type: { type: String, enum: ['message', 'join', 'leave', 'focus'], default: 'message' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Message', messageSchema);
