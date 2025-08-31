const mongoose = require("mongoose");

const studyRoomSchema = new mongoose.Schema({
  name: { type: String, required: true }, // Room name
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  participants: [{ type: String }], // store socket IDs or usernames
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.models.StudyRoom || mongoose.model("StudyRoom", studyRoomSchema);
