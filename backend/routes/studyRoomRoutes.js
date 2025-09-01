const express = require("express");
const studyRoomController = require("../controllers/studyRoomController");

const router = express.Router();

// ✅ Create a room
router.post("/create", studyRoomController.createRoom);

// ✅ Get all rooms
router.get("/", studyRoomController.getRooms);

// ✅ Get room by code (must be before /:id to avoid conflict)
router.get("/code/:code", studyRoomController.getRoomByCode);

// ✅ Get room by MongoDB ID OR "public-room"
router.get("/:id", studyRoomController.getRoomById);

// ✅ Save a chat message
router.post("/messages", studyRoomController.saveMessage); 
// 🔄 changed to plural to match "/:roomId/messages"

// ✅ Get messages of a room
router.get("/:roomId/messages", studyRoomController.getMessages);

module.exports = router;
