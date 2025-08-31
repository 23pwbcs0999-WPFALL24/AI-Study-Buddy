const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ai-study-buddy');
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1);
  }
};

// Test database connection and create sample data
const testDatabase = async () => {
  try {
    await connectDB();
    
    // Test User model
    const User = require('./models/User');
    const Note = require('./models/Note');
    
    console.log('Testing User model...');
    
    // Check if test user exists
    let testUser = await User.findOne({ email: 'test@example.com' });
    
    if (!testUser) {
      console.log('Creating test user...');
      testUser = await User.create({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      });
      console.log('Test user created:', testUser._id);
    } else {
      console.log('Test user already exists:', testUser._id);
    }
    
    // Check existing notes
    const existingNotes = await Note.find({ user: testUser._id });
    console.log(`Found ${existingNotes.length} existing notes for test user`);
    
    // Create test notes if none exist
    if (existingNotes.length === 0) {
      console.log('Creating test notes...');
      
      const testNotes = [
        {
          user: testUser._id,
          title: 'Sample Study Note',
          content: 'This is a sample study note for testing purposes. It contains some basic content to test the notes functionality.',
          tags: ['sample', 'test'],
          category: 'personal'
        },
        {
          user: testUser._id,
          title: 'Academic Research',
          content: 'Research notes on artificial intelligence and machine learning concepts. This note contains important information about AI fundamentals.',
          tags: ['ai', 'research', 'academic'],
          category: 'academic'
        },
        {
          user: testUser._id,
          title: 'Work Project Notes',
          content: 'Project planning and task management notes. Important deadlines and milestones for the current project.',
          tags: ['work', 'project', 'planning'],
          category: 'work'
        }
      ];
      
      const createdNotes = await Note.insertMany(testNotes);
      console.log(`Created ${createdNotes.length} test notes`);
      
      // Update user stats
      testUser.stats.totalNotes = createdNotes.length;
      testUser.stats.totalStudyTime = 120; // 2 hours
      testUser.streaks.current = 3;
      testUser.streaks.longest = 5;
      testUser.streaks.lastStudyDate = new Date();
      testUser.studyHistory.push({
        activity: 'note_created',
        details: 'Created test notes',
        timestamp: new Date()
      });
      
      await testUser.save();
      console.log('Updated user stats');
    }
    
    // Test the stats endpoint
    console.log('\nTesting stats endpoint...');
    const stats = {
      totalNotes: testUser.stats.totalNotes,
      studyStreak: testUser.streaks.current,
      totalStudyTime: testUser.stats.totalStudyTime,
      lastActive: testUser.stats.lastActive,
      totalSummaries: testUser.stats.totalSummaries,
      totalFlashcards: testUser.stats.totalFlashcards,
      totalQuizzes: testUser.stats.totalQuizzes,
      badgesCount: testUser.badges.length
    };
    
    console.log('User stats:', stats);
    
    console.log('\nDatabase test completed successfully!');
    
  } catch (error) {
    console.error('Database test failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

// Run the test
testDatabase();
