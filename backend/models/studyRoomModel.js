const mongoose = require("mongoose"); // <-- missing line

const studyRoomSchema = new mongoose.Schema({
  name: { type: String, required: true },
  code: { type: String, unique: true, required: true }, // ✅ new
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  participants: [{ type: String }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.models.StudyRoom || mongoose.model("StudyRoom", studyRoomSchema);
