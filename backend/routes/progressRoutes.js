const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const { getUserProgress, getUserStats } = require('../controllers/progressController');

// Apply auth middleware to all routes
router.use(authMiddleware);

// @route   GET /api/progress
// @desc    Get user progress metrics
// @access  Private
router.get('/', getUserProgress);

// @route   GET /api/progress/stats
// @desc    Get user stats for dashboard
// @access  Private
router.get('/stats', getUserStats);

module.exports = router;
