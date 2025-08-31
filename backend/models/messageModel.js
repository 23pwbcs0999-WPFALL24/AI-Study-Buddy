const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  // Room can be either StudyRoom ObjectId OR a string (like "public-room")
  room: { type: mongoose.Schema.Types.Mixed, required: true },

  // Either socket ID (guest) or real user._id if logged in
  userId: { type: String },  

  // Display name of sender
  username: { type: String, required: true },

  // Actual message text (or session name if type = "focus")
  text: { type: String, required: true },

  // Message type
  type: { 
    type: String, 
    enum: ["message", "join", "leave", "focus", "note", "quiz"], 
    default: "message" 
  },

  createdAt: { type: Date, default: Date.now }
});

// Prevent OverwriteModelError
module.exports = mongoose.models.Message || mongoose.model("Message", messageSchema);
