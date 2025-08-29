// routes/studyRoomRoutes.js
const express = require("express");
const router = express.Router();
const studyRoomController = require("../controllers/studyRoomController");

// Create a new room
router.post("/create", studyRoomController.createRoom);

// Get all rooms
router.get("/", studyRoomController.getRooms);

// Get single room details
router.get("/:id", studyRoomController.getRoomById);

// Save a chat message
router.post("/message", studyRoomController.saveMessage);

// Get messages for a room
router.get("/:roomId/messages", studyRoomController.getMessages);

module.exports = router;
