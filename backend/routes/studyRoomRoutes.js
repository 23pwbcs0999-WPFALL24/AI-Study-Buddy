const express = require("express");
const studyRoomController = require("../controllers/studyRoomController");

const router = express.Router();

// Create a room
router.post("/create", studyRoomController.createRoom);

// Get all rooms
router.get("/", studyRoomController.getRooms);

// ✅ Get room by code (before "/:id")
router.get("/code/:code", studyRoomController.getRoomByCode);

// Get room by MongoDB ID
router.get("/:id", studyRoomController.getRoomById);

// Save a chat message
router.post("/message", studyRoomController.saveMessage);

// Get messages of a room
router.get("/:roomId/messages", studyRoomController.getMessages);

module.exports = router;
