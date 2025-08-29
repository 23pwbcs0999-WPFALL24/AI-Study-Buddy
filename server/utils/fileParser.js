// utils/fileParser.js
const fs = require('fs').promises;
const path = require('path');
const { processPDF } = require('./pdfParser');
const mammoth = require('mammoth'); // for .docx

/**
 * Parse a file based on mimetype
 * @param {string} filePath
 * @param {string} mimetype
 */
const parseFile = async (filePath, mimetype) => {
  try {
    if (mimetype === 'application/pdf') {
      const buffer = await fs.readFile(filePath);
      return await processPDF(buffer);
    }
    if (
      mimetype ===
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ) {
      const buffer = await fs.readFile(filePath);
      const result = await mammoth.extractRawText({ buffer });
      return {
        success: true,
        cleanedText: result.value,
        keyInfo: {
          wordCount: result.value.split(/\s+/).length,
        },
      };
    }
    if (mimetype === 'text/plain') {
      const content = await fs.readFile(filePath, 'utf8');
      return {
        success: true,
        cleanedText: content.trim(),
        keyInfo: {
          wordCount: content.split(/\s+/).length,
        },
      };
    }
    throw new Error(`Unsupported file type: ${mimetype}`);
  } catch (err) {
    return { success: false, error: err.message };
  }
};

module.exports = { parseFile };
