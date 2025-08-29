const User = require('../models/User');

// @desc    Get user progress
// @route   GET /api/progress
// @access  Private
const getUserProgress = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update last active
    user.updateLastActive();
    await user.save();

    const progress = {
      stats: {
        totalNotes: user.stats?.totalNotes || 0,
        totalSummaries: user.stats?.totalSummaries || 0,
        totalFlashcards: user.stats?.totalFlashcards || 0,
        totalQuizzes: user.stats?.totalQuizzes || 0,
        studyRoomsJoined: user.stats?.studyRoomsJoined || 0,
        totalStudyTime: user.stats?.totalStudyTime || 0,
        lastActive: user.stats?.lastActive || new Date()
      },
      streaks: {
        current: user.streaks?.current || 0,
        longest: user.streaks?.longest || 0,
        lastStudyDate: user.streaks?.lastStudyDate || null
      },
      badges: user.badges || [],
      studyHistory: user.studyHistory || []
    };

    res.status(200).json({
      success: true,
      progress
    });

  } catch (error) {
    console.error('Get user progress error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching progress'
    });
  }
};

// @desc    Get user stats for dashboard
// @route   GET /api/progress/stats
// @access  Private
const getUserStats = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update last active
    user.updateLastActive();
    await user.save();

    const stats = {
      totalNotes: user.stats?.totalNotes || 0,
      studyStreak: user.streaks?.current || 0,
      totalStudyTime: user.stats?.totalStudyTime || 0,
      lastActive: user.stats?.lastActive || new Date(),
      totalSummaries: user.stats?.totalSummaries || 0,
      totalFlashcards: user.stats?.totalFlashcards || 0,
      totalQuizzes: user.stats?.totalQuizzes || 0,
      badgesCount: user.badges?.length || 0
    };

    res.status(200).json({
      success: true,
      stats
    });

  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching stats'
    });
  }
};

// @desc    Update study time
// @route   POST /api/progress/study-time
// @access  Private
const updateStudyTime = async (req, res) => {
  try {
    const { minutes } = req.body;
    
    if (!minutes || minutes <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid study time in minutes is required'
      });
    }

    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update study time
    user.stats.totalStudyTime += minutes;
    user.updateLastActive();
    user.updateStreak();
    
    // Add to study history
    user.studyHistory.push({
      activity: 'study_room_joined',
      details: `Studied for ${minutes} minutes`,
      timestamp: new Date()
    });

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Study time updated successfully',
      totalStudyTime: user.stats.totalStudyTime
    });

  } catch (error) {
    console.error('Update study time error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating study time'
    });
  }
};

// @desc    Get study history
// @route   GET /api/progress/history
// @access  Private
const getStudyHistory = async (req, res) => {
  try {
    const { limit = 20 } = req.query;
    
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const history = user.studyHistory
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, parseInt(limit));

    res.status(200).json({
      success: true,
      history
    });

  } catch (error) {
    console.error('Get study history error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching study history'
    });
  }
};

module.exports = {
  getUserProgress,
  getUserStats,
  updateStudyTime,
  getStudyHistory
};
