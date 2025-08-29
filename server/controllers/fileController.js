const mongoose = require('mongoose');
const multer = require('multer');
const { GridFSBucket } = require('mongodb');
const User = require('../models/User');
const { processPDF } = require('../utils/pdfParser');
const Note = require('../models/Note'); 
const mammoth = require("mammoth");
const { parseFile } = require('../utils/fileParser');

let gfsBucket;

// Initialize GridFS
mongoose.connection.once('open', () => {
  gfsBucket = new GridFSBucket(mongoose.connection.db, {
    bucketName: 'uploads'
  });
});

// Configure multer for memory storage
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  // Allow PDF, DOCX, and text files
  if (
    file.mimetype === 'application/pdf' ||
    file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || // .docx
    file.mimetype === 'text/plain' ||
    file.mimetype === 'text/markdown'
  ) {
    cb(null, true);
  } else {
    cb(new Error('Only PDF, DOCX, and text files are allowed'), false);
  }
};


const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// @desc    Upload file
// @route   POST /api/files/upload
// @access  Private


const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const { originalname, mimetype, buffer } = req.file;
    const userId = req.user.id;

    // Create upload stream to GridFS
    const uploadStream = gfsBucket.openUploadStream(originalname, {
      metadata: {
        userId,
        originalName: originalname,
        mimetype,
        uploadDate: new Date()
      }
    });

    let extractedText = '';
    let processingResult = null;

    // ✅ Extract text depending on file type
processingResult = await parseFile(buffer, mimetype);
if (processingResult.success) {
  extractedText = processingResult.cleanedText;
}

    // Upload file into GridFS
    uploadStream.end(buffer);

    uploadStream.on('finish', async () => {
      try {
        // ✅ Map mimetype to correct source.type
        let sourceType = 'manual';
        if (mimetype === 'application/pdf') {
          sourceType = 'pdf_upload';
        } else if (
          mimetype === 'text/plain' ||
          mimetype === 'text/markdown'
        ) {
          sourceType = 'text_upload';
        } else if (
          mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ) {
          sourceType = 'docx_upload';
        }

        // ✅ Create Note directly
        const note = await Note.create({
          user: userId,
          title: originalname,
          content: extractedText || `Uploaded file: ${originalname}`,
          category: "uploaded",
          tags: ["upload", mimetype.split('/')[1] || "file"],
          source: { type: sourceType, fileId: uploadStream.id, fileName: originalname }
        });

        // ✅ Update User document
        const user = await User.findById(userId);
        user.uploadedFiles.push({
          filename: originalname,
          originalName: originalname,
          fileId: uploadStream.id,
          fileType: mimetype,
          extractedText
        });
        user.stats.totalNotes += 1;
        user.studyHistory.push({
          activity: 'note_created',
          details: `Uploaded file: ${originalname}`,
          timestamp: new Date()
        });
        user.updateStreak();
        await user.save();

        res.status(201).json({
          success: true,
          message: 'File uploaded & note created',
          note,
          file: {
            id: uploadStream.id,
            filename: uploadStream.filename,
            originalName: originalname,
            mimetype,
            extractedText,
            processingResult: processingResult?.keyInfo || null
          }
        });
      } catch (error) {
        console.error('Error updating user after file upload:', error);
        res.status(500).json({
          success: false,
          message: 'File uploaded but failed to update user/note data'
        });
      }
    });

    uploadStream.on('error', (error) => {
      console.error('GridFS upload error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to upload file'
      });
    });

  } catch (error) {
    console.error('File upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during file upload'
    });
  }
};



// @desc    Get file by ID
// @route   GET /api/files/:id
// @access  Private
const getFile = async (req, res) => {
  try {
    const fileId = new mongoose.Types.ObjectId(req.params.id);
    
    // Check if file exists and user has access
    const file = await gfsBucket.find({ _id: fileId }).toArray();
    
    if (!file || file.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    const fileDoc = file[0];
    
    // Check if user owns the file
    if (fileDoc.metadata.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Set appropriate headers
    res.set({
      'Content-Type': fileDoc.metadata.mimetype,
      'Content-Disposition': `attachment; filename="${fileDoc.metadata.originalName}"`
    });

    // Stream file to response
    const downloadStream = gfsBucket.openDownloadStream(fileId);
    downloadStream.pipe(res);

    downloadStream.on('error', (error) => {
      console.error('File download error:', error);
      res.status(500).json({
        success: false,
        message: 'Error downloading file'
      });
    });

  } catch (error) {
    console.error('Get file error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while retrieving file'
    });
  }
};

// @desc    Delete file
// @route   DELETE /api/files/:id
// @access  Private
const deleteFile = async (req, res) => {
  try {
    const fileId = new mongoose.Types.ObjectId(req.params.id);
    
    // Check if file exists and user has access
    const file = await gfsBucket.find({ _id: fileId }).toArray();
    
    if (!file || file.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    const fileDoc = file[0];
    
    // Check if user owns the file
    if (fileDoc.metadata.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Delete file from GridFS
    await gfsBucket.delete(fileId);

    // Remove from user's uploaded files
    const user = await User.findById(req.user.id);
    user.uploadedFiles = user.uploadedFiles.filter(
      file => file.fileId.toString() !== fileId.toString()
    );
    await user.save();

    res.status(200).json({
      success: true,
      message: 'File deleted successfully'
    });

  } catch (error) {
    console.error('Delete file error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting file'
    });
  }
};

// @desc    Get user's files
// @route   GET /api/files
// @access  Private
const getUserFiles = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('uploadedFiles');
    
    res.status(200).json({
      success: true,
      files: user.uploadedFiles
    });
  } catch (error) {
    console.error('Get user files error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while retrieving files'
    });
  }
};

// @desc    Extract text from uploaded file
// @route   POST /api/files/extract-text
// @access  Private

const extractTextFromFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const { mimetype, buffer } = req.file;

    // Use centralized parser
    const processingResult = await parseFile(buffer, mimetype);

    if (!processingResult.success) {
      return res.status(400).json({
        success: false,
        message: 'Failed to extract text',
        error: processingResult.error
      });
    }

    res.status(200).json({
      success: true,
      extractedText: processingResult.cleanedText,
      processingResult: processingResult.keyInfo || null
    });

  } catch (error) {
    console.error('Text extraction error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during text extraction'
    });
  }
};
module.exports = {
  upload,
  uploadFile,
  getFile,
  deleteFile,
  getUserFiles,
  extractTextFromFile
};
