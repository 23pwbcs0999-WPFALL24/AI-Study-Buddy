const User = require('../models/User');
const Note = require('../models/Note');

// @desc    Get user progress (Profile page)
// @route   GET /api/progress
// @access  Private
// const getUserProgress = async (req, res) => {
//   try {
//     const user = await User.findById(req.user.id);

//     if (!user) {
//       return res.status(404).json({
//         success: false,
//         message: 'User not found'
//       });
//     }

//     // Update last active + save
//     user.updateLastActive();
//     await user.save();

//     const progress = {
//       _id: user._id,
//       name: user.name,
//       email: user.email,
//       createdAt: user.createdAt,
//       stats: {
//         totalNotes: user.stats?.totalNotes || 0,
//         studyStreak: user.streaks?.current || 0,     // map streaks.current → studyStreak
//         totalStudyTime: user.stats?.totalStudyTime || 0,
//         lastActive: user.stats?.lastActive || new Date()
//       },
//       badges: user.badges || [],
//       studyHistory: user.studyHistory || []
//     };

//     return res.status(200).json(progress);
//   } catch (error) {
//     console.error('Get user progress error:', error);
//     return res.status(500).json({
//       success: false,
//       message: 'Server error while fetching progress'
//     });
//   }
// };
// const User = require('../models/User');
// const Note = require('../models/Note');

// @desc    Get user progress (Profile page)
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

    // Always calculate from DB so it matches actual notes
    const totalNotes = await Note.countDocuments({ user: user._id });

    // Update last active + save
    user.updateLastActive();
    await user.save();

    const progress = {
      _id: user._id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
      stats: {
        totalNotes,  // ✅ fixed (real DB count)
        studyStreak: user.streaks?.current || 0,
        totalStudyTime: user.stats?.totalStudyTime || 0,
        lastActive: user.stats?.lastActive || new Date()
      },
      badges: user.badges || [],
      studyHistory: user.studyHistory || []
    };

    return res.status(200).json(progress);
  } catch (error) {
    console.error('Get user progress error:', error);
    return res.status(500).json({
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
    const userId = req.user.id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Always fetch live counts
    const totalNotes = await Note.countDocuments({ user: userId });

    const stats = {
      totalNotes,
      studyStreak: user.streaks?.current || 0,
      totalStudyTime: user.stats?.totalStudyTime || 0,
      lastActive: user.stats?.lastActive || new Date(),
      totalSummaries: user.stats?.totalSummaries || 0,
      totalFlashcards: user.stats?.totalFlashcards || 0,
      totalQuizzes: user.stats?.totalQuizzes || 0,
      badgesCount: user.badges?.length || 0,
    };

    res.status(200).json({ success: true, stats });
  } catch (err) {
    console.error('Get user stats error:', err);
    res.status(500).json({ success: false, message: 'Server error while fetching stats' });
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

    // Update stats
    user.stats.totalStudyTime += minutes;
    user.updateLastActive();
    user.updateStreak();

    // Push into study history
    user.studyHistory.push({
      activity: 'study_time',
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
