// const User = require('../models/User');
// const axios = require('axios');

// // ✅ Fixed: Correct Hugging Face API call
// const callHuggingFaceAPI = async (model, payload) => {
//   try {
//     const response = await axios.post(
//       `https://api-inference.huggingface.co/models/${model}`,
//       payload,
//       {
//         headers: {
//           Authorization: `Bearer ${process.env.HUGGING_FACE_API_KEY}`,
//           'Content-Type': 'application/json'
//         },
//         timeout: 60000
//       }
//     );
//     return response.data;
//   } catch (error) {
//     console.error(`Hugging Face API error for ${model}:`, error.response?.status, error.message);
//     throw error;
//   }
// };

// // ✅ Summary generation (BART works on HF API)
// const generateSummary = async (req, res) => {
//   try {
//     const { text, maxLength = 150 } = req.body;
//     if (!text || text.trim().length === 0) {
//       return res.status(400).json({ success: false, message: 'Text is required' });
//     }

//     let summary = '';
//     if (process.env.HUGGING_FACE_API_KEY) {
//       const payload = {
//         inputs: text,
//         parameters: { max_length: Math.min(maxLength, 500), min_length: 30, do_sample: false }
//       };
//       try {
//         const result = await callHuggingFaceAPI('facebook/bart-large-cnn', payload);
//         if (Array.isArray(result) && result[0]?.summary_text) summary = result[0].summary_text;
//       } catch (_) {}
//     }

//     if (!summary) summary = createFallbackSummary(text, maxLength);

//     res.status(200).json({ success: true, summary });
//   } catch (err) {
//     console.error('Summary generation error:', err);
//     res.status(500).json({ success: false, message: 'Summary failed' });
//   }
// };

// const createFallbackSummary = (text, maxLength = 150) => {
//   const sentences = text.match(/[^.!?]+[.!?]+/g) || [];
//   let summary = '';
//   for (const sentence of sentences) {
//     if ((summary + sentence).length <= maxLength) summary += sentence;
//     else break;
//   }
//   return summary || text.substring(0, maxLength);
// };

// // ✅ Flashcards / Quiz / Chat / Explain all routed through t5-base (works on HF API)
// const generateFlashcards = async (req, res) => {
//   try {
//     const { text } = req.body;
//     if (!text) return res.status(400).json({ success: false, message: 'Text required' });

//     let flashcards = [];
//     if (process.env.HUGGING_FACE_API_KEY) {
//       const prompt = `Create 5 study flashcards from this text. Format as JSON [{"question":...,"answer":...}].\nText: ${text}\nFlashcards:`;
//       const payload = { inputs: prompt, parameters: { max_new_tokens: 300, temperature: 0.7, return_full_text: false } };
//       try {
//         const result = await callHuggingFaceAPI('t5-base', payload);
//         const response = result[0]?.generated_text || '';
//         const jsonMatch = response.match(/\[.*\]/s);
//         if (jsonMatch) flashcards = JSON.parse(jsonMatch[0]);
//       } catch (_) {}
//     }
//     if (!flashcards.length) flashcards = createFallbackFlashcards(text);

//     res.status(200).json({ success: true, flashcards });
//   } catch (err) {
//     res.status(500).json({ success: false, message: 'Flashcard generation failed' });
//   }
// };

// const createFallbackFlashcards = (text) => {
//   const sentences = text.match(/[^.!?]+[.!?]+/g) || [];
//   return sentences.slice(0, 5).map((s, i) => ({ question: `Key point ${i + 1}?`, answer: s.trim() }));
// };

// const generateQuiz = async (req, res) => {
//   try {
//     const { text } = req.body;
//     let quiz = [];
//     if (process.env.HUGGING_FACE_API_KEY) {
//       const prompt = `Create 5 MCQs from this text in JSON [{"question":...,"options":[...],"correctAnswer":0}]. Text: ${text}`;
//       const payload = { inputs: prompt, parameters: { max_new_tokens: 400, temperature: 0.7, return_full_text: false } };
//       try {
//         const result = await callHuggingFaceAPI('t5-base', payload);
//         const response = result[0]?.generated_text || '';
//         const jsonMatch = response.match(/\[.*\]/s);
//         if (jsonMatch) quiz = JSON.parse(jsonMatch[0]);
//       } catch (_) {}
//     }
//     if (!quiz.length) quiz = createFallbackQuiz(text);

//     res.status(200).json({ success: true, quiz });
//   } catch (err) {
//     res.status(500).json({ success: false, message: 'Quiz generation failed' });
//   }
// };

// const createFallbackQuiz = (text) => [{
//   question: 'What is the main topic of the text?',
//   options: ['Main topic stated', 'No main topic', 'Multiple topics', 'Not mentioned'],
//   correctAnswer: 0
// }];

// const chatWithAI = async (req, res) => {
//   try {
//     const { message } = req.body;
//     const prompt = `You are a helpful study assistant. Student: ${message}\nAI:`;

//     let response = '';
//     if (process.env.HUGGING_FACE_API_KEY) {
//       const payload = { inputs: prompt, parameters: { max_new_tokens: 200, temperature: 0.7, return_full_text: false } };
//       try {
//         const result = await callHuggingFaceAPI('t5-base', payload);
//         response = result[0]?.generated_text || '';
//       } catch (_) {}
//     }
//     if (!response) response = generateFallbackResponse(message);

//     res.status(200).json({ success: true, response });
//   } catch (err) {
//     res.status(500).json({ success: false, message: 'Chat failed' });
//   }
// };

// const generateFallbackResponse = (message) => `I'm your AI study assistant. You asked: "${message}". Let's work through it together!`;

// const explainConcept = async (req, res) => {
//   try {
//     const { text } = req.body;
//     const prompt = `Explain clearly: ${text}`;

//     let explanation = '';
//     if (process.env.HUGGING_FACE_API_KEY) {
//       const payload = { inputs: prompt, parameters: { max_new_tokens: 400, temperature: 0.7, return_full_text: false } };
//       try {
//         const result = await callHuggingFaceAPI('t5-base', payload);
//         explanation = result[0]?.generated_text || '';
//       } catch (_) {}
//     }
//     if (!explanation) explanation = createFallbackSummary(text, 250);

//     res.status(200).json({ success: true, explanation });
//   } catch (err) {
//     res.status(500).json({ success: false, message: 'Explanation failed' });
//   }
// };

// module.exports = { generateSummary, generateFlashcards, generateQuiz, chatWithAI, explainConcept };
// aiController.js
const { CohereClient } = require("cohere-ai");
const User = require("../models/User");

// ✅ Initialize client properly
const cohere = new CohereClient({
  token: process.env.COHERE_API_KEY,
});

// Helper: call Cohere chat API
const callCohere = async (prompt) => {
  console.log("🔹 Sending prompt to Cohere Chat API:", prompt);
  try {
    const response = await cohere.chat({
      model: "command-r",   // ✅ free-tier chat model
      message: prompt,
    });

    console.log("✅ Cohere response:", response.text);
    return response.text.trim();
  } catch (err) {
    console.error("❌ Cohere Chat API error:", err);
    return "";
  }
};


// ✅ Summary generation
const generateSummary = async (req, res) => {
  try {
    const { text, maxLength = 150 } = req.body;
    if (!text || text.trim().length === 0) {
      return res.status(400).json({ success: false, message: "Text is required" });
    }

    let summary = "";
    try {
      const prompt = `Summarize the following text in under ${maxLength} words:\n\n${text}\n\nSummary:`;
      summary = await callCohere(prompt);
    } catch (_) {}

    if (!summary) summary = createFallbackSummary(text, maxLength);
    res.status(200).json({ success: true, summary });
  } catch (err) {
    console.error("❌ Summary generation error:", err);
    res.status(500).json({ success: false, message: "Summary failed" });
  }
};

const createFallbackSummary = (text, maxLength = 150) => {
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [];
  let summary = "";
  for (const sentence of sentences) {
    if ((summary + sentence).length <= maxLength) summary += sentence;
    else break;
  }
  return summary || text.substring(0, maxLength);
};

// ✅ Flashcards
const generateFlashcards = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ success: false, message: "Text required" });

    let flashcards = [];
    try {
      const prompt = `Create 5 study flashcards from this text. Format as JSON [{"question":"...","answer":"..."}].\n\nText: ${text}\n\nFlashcards:`;
      const response = await callCohere(prompt);
      const jsonMatch = response.match(/\[.*\]/s);
      if (jsonMatch) flashcards = JSON.parse(jsonMatch[0]);
    } catch (err) {
      console.error("❌ Flashcard generation error:", err);
    }

    if (!flashcards.length) flashcards = createFallbackFlashcards(text);
    res.status(200).json({ success: true, flashcards });
  } catch (err) {
    console.error("❌ Flashcards error:", err);
    res.status(500).json({ success: false, message: "Flashcard generation failed" });
  }
};

const createFallbackFlashcards = (text) => {
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [];
  return sentences.slice(0, 5).map((s, i) => ({
    question: `Key point ${i + 1}?`,
    answer: s.trim(),
  }));
};

// ✅ Quiz
const generateQuiz = async (req, res) => {
  try {
    const { text } = req.body;
    let quiz = [];
    try {
      const prompt = `Create 5 multiple-choice questions from this text. Format as JSON [{"question":"...","options":["...","..."],"correctAnswer":0}].\n\nText: ${text}\n\nQuiz:`;
      const response = await callCohere(prompt);
      const jsonMatch = response.match(/\[.*\]/s);
      if (jsonMatch) quiz = JSON.parse(jsonMatch[0]);
    } catch (err) {
      console.error("❌ Quiz generation error:", err);
    }

    if (!quiz.length) quiz = createFallbackQuiz(text);
    res.status(200).json({ success: true, quiz });
  } catch (err) {
    console.error("❌ Quiz error:", err);
    res.status(500).json({ success: false, message: "Quiz generation failed" });
  }
};

const createFallbackQuiz = (text) => [
  {
    question: "What is the main topic of the text?",
    options: ["Main topic stated", "No main topic", "Multiple topics", "Not mentioned"],
    correctAnswer: 0,
  },
];

// ✅ Chat
const chatWithAI = async (req, res) => {
  try {
    const { message } = req.body;
    const prompt = `You are a helpful study assistant.\nStudent: ${message}\nAI:`;

    let response = "";
    try {
      response = await callCohere(prompt);
    } catch (_) {}

    if (!response) response = generateFallbackResponse(message);
    res.status(200).json({ success: true, response });
  } catch (err) {
    console.error("❌ Chat error:", err);
    res.status(500).json({ success: false, message: "Chat failed" });
  }
};

const generateFallbackResponse = (message) =>
  `I'm your AI study assistant. You asked: "${message}". Let's work through it together!`;

// ✅ Explain
const explainConcept = async (req, res) => {
  try {
    const { text } = req.body;
    const prompt = `Explain the following concept clearly and simply:\n\n${text}\n\nExplanation:`;

    let explanation = "";
    try {
      explanation = await callCohere(prompt);
    } catch (_) {}

    if (!explanation) explanation = createFallbackSummary(text, 250);
    res.status(200).json({ success: true, explanation });
  } catch (err) {
    console.error("❌ Explanation error:", err);
    res.status(500).json({ success: false, message: "Explanation failed" });
  }
};

module.exports = {
  generateSummary,
  generateFlashcards,
  generateQuiz,
  chatWithAI,
  explainConcept,
};
