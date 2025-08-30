# 📚 Study Buddy

**Study Buddy** is a **full-stack AI-powered learning platform** that helps students organize study materials, collaborate in real-time, and enhance their learning with AI tools.  
Built with **React (TypeScript), Node.js, Express, MongoDB, and Socket.io**, it blends **organization, collaboration, gamification, and AI** into one seamless study experience.  

🚀 **Deployment coming soon!**

---

## ✨ Features

### 🔐 User Management
- Secure JWT authentication
- Profile with progress tracking
- Badges & achievements system

### 📝 Smart Notes
- Create, edit, and delete notes
- Upload files (PDF, DOCX, TXT) → auto text extraction
- Tagging & advanced search
- Shareable notes

### 🤖 AI-Powered Tools
- Summarization of long text
- Auto flashcard generation
- Quiz generator for practice
- Concept explanations
- AI chat for conversational learning

### 👥 Real-Time Study Rooms
- WebSocket-based collaboration
- Pomodoro timers (25/5), deep focus (50), custom sessions
- Live chat with message persistence
- User presence indicators
- Shareable study room links

### 📊 Progress Tracking
- Study streaks 🔥
- Time analytics
- Study history timeline
- Achievement badges 🏆

### 🎮 Gamified Learning
- Motivation through streaks, badges & milestones
- Visual progress stats

---

## 🛠️ Tech Stack

### Frontend
- React + TypeScript
- React Router
- Socket.io Client
- Responsive CSS

### Backend
- Node.js + Express.js
- MongoDB + Mongoose
- Socket.io for real-time features
- JWT authentication
- GridFS + Multer for file handling

### File Processing
- **PDF.js** – PDF extraction
- **Mammoth.js** – DOCX parsing
- Custom text utilities

### AI Integration
- AI endpoints for summarization, quizzes, flashcards, and chat
- Structured & context-aware responses

---

## 🗄️ Database Models

- **User** → Profile, stats, streaks, badges, study history
- **Note** → Content, tags, categorization, sharing
- **Message** → Chat messages, room associations
- **File** → Stored in GridFS with metadata & extracted text

---

## 🔌 API Endpoints (Highlights)

### Auth
- `POST /api/auth/signup` – Register
- `POST /api/auth/login` – Login
- `GET /api/auth/profile` – User profile

### Notes
- `POST /api/notes` – Create note
- `GET /api/notes` – Fetch notes
- `GET /api/notes/search` – Search notes

### Files
- `POST /api/files/upload` – Upload & process
- `GET /api/files/:id` – Download file

### AI
- `POST /api/ai/summarize` – Summarize text
- `POST /api/ai/flashcards` – Generate flashcards
- `POST /api/ai/quiz` – Generate quizzes
- `POST /api/ai/chat` – AI conversation

### Progress
- `GET /api/progress` – User progress overview
- `POST /api/progress/study-time` – Update study time
- `GET /api/progress/history` – Study history

### Study Rooms
- `POST /api/studyrooms` – Create room
- `GET /api/studyrooms/:id` – Room details
- `GET /api/studyrooms/:roomId/messages` – Room messages

---

## ⚡ Real-Time Features
- User join/leave notifications
- Live chat with persistence
- Shared Pomodoro timers
- Group study session sync
- Collaborative environment

---

## 🔒 Security
- JWT-based authentication
- Password hashing with bcrypt
- File validation & sanitization
- User-specific data access controls
- CORS configuration

---

## 🚀 Getting Started

### 1️⃣ Clone the repository
```bash
git clone https://github.com/your-username/study-buddy.git
cd study-buddy
2️⃣ Install dependencies
bash
Copy code
# Install backend deps
cd backend
npm install

# Install frontend deps
cd ../frontend
npm install
3️⃣ Setup environment variables
Create a .env file in both backend and frontend with:

ini
Copy code
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
CLOUDINARY_URL=your_cloudinary_url (if using file uploads)
4️⃣ Run the app
bash
Copy code
# Start backend
cd backend
npm run dev

# Start frontend
cd ../frontend
npm start
📈 Roadmap / Future Enhancements
📱 Mobile app (React Native)

🎥 Video conferencing inside study rooms

📅 Calendar integration for planning

📊 Advanced analytics for learning patterns

🗂️ Export notes in multiple formats

📶 Offline support (PWA)

🎓 Educational Value
Study Buddy makes studying organized, engaging, and collaborative by combining:

AI efficiency – Summarize, quiz, explain

Collaboration – Real-time study rooms

Motivation – Streaks, badges & progress

Accessibility – Multi-format file support

🤝 Contributing
Contributions, issues, and feature requests are welcome!
Feel free to open a PR or raise an issue to make Study Buddy even better.

📜 License
MIT License

🌟 Show Your Support
If you like this project, star the repo ⭐ and stay tuned for deployment updates!

yaml
Copy code
# 📚 Study Buddy

**Study Buddy** is a **full-stack AI-powered learning platform** that helps students organize study materials, collaborate in real-time, and enhance their learning with AI tools.  
Built with **React (TypeScript), Node.js, Express, MongoDB, and Socket.io**, it blends **organization, collaboration, gamification, and AI** into one seamless study experience.  

🚀 **Deployment coming soon!**

---

## ✨ Features

### 🔐 User Management
- Secure JWT authentication
- Profile with progress tracking
- Badges & achievements system

### 📝 Smart Notes
- Create, edit, and delete notes
- Upload files (PDF, DOCX, TXT) → auto text extraction
- Tagging & advanced search
- Shareable notes

### 🤖 AI-Powered Tools
- Summarization of long text
- Auto flashcard generation
- Quiz generator for practice
- Concept explanations
- AI chat for conversational learning

### 👥 Real-Time Study Rooms
- WebSocket-based collaboration
- Pomodoro timers (25/5), deep focus (50), custom sessions
- Live chat with message persistence
- User presence indicators
- Shareable study room links

### 📊 Progress Tracking
- Study streaks 🔥
- Time analytics
- Study history timeline
- Achievement badges 🏆

### 🎮 Gamified Learning
- Motivation through streaks, badges & milestones
- Visual progress stats

---

## 🛠️ Tech Stack

### Frontend
- React + TypeScript
- React Router
- Socket.io Client
- Responsive CSS

### Backend
- Node.js + Express.js
- MongoDB + Mongoose
- Socket.io for real-time features
- JWT authentication
- GridFS + Multer for file handling

### File Processing
- **PDF.js** – PDF extraction
- **Mammoth.js** – DOCX parsing
- Custom text utilities

### AI Integration
- AI endpoints for summarization, quizzes, flashcards, and chat
- Structured & context-aware responses

---

## 🗄️ Database Models

- **User** → Profile, stats, streaks, badges, study history
- **Note** → Content, tags, categorization, sharing
- **Message** → Chat messages, room associations
- **File** → Stored in GridFS with metadata & extracted text

---

## 🔌 API Endpoints (Highlights)

### Auth
- `POST /api/auth/signup` – Register
- `POST /api/auth/login` – Login
- `GET /api/auth/profile` – User profile

### Notes
- `POST /api/notes` – Create note
- `GET /api/notes` – Fetch notes
- `GET /api/notes/search` – Search notes

### Files
- `POST /api/files/upload` – Upload & process
- `GET /api/files/:id` – Download file

### AI
- `POST /api/ai/summarize` – Summarize text
- `POST /api/ai/flashcards` – Generate flashcards
- `POST /api/ai/quiz` – Generate quizzes
- `POST /api/ai/chat` – AI conversation

### Progress
- `GET /api/progress` – User progress overview
- `POST /api/progress/study-time` – Update study time
- `GET /api/progress/history` – Study history

### Study Rooms
- `POST /api/studyrooms` – Create room
- `GET /api/studyrooms/:id` – Room details
- `GET /api/studyrooms/:roomId/messages` – Room messages

---

## ⚡ Real-Time Features
- User join/leave notifications
- Live chat with persistence
- Shared Pomodoro timers
- Group study session sync
- Collaborative environment

---

## 🔒 Security
- JWT-based authentication
- Password hashing with bcrypt
- File validation & sanitization
- User-specific data access controls
- CORS configuration

---

## 🚀 Getting Started

### 1️⃣ Clone the repository
```bash
git clone https://github.com/your-username/study-buddy.git
cd study-buddy
2️⃣ Install dependencies
bash
Copy code
# Install backend deps
cd backend
npm install

# Install frontend deps
cd ../frontend
npm install
3️⃣ Setup environment variables
Create a .env file in both backend and frontend with:

ini
Copy code
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
CLOUDINARY_URL=your_cloudinary_url (if using file uploads)
4️⃣ Run the app
bash
Copy code
# Start backend
cd backend
npm run dev

# Start frontend
cd ../frontend
npm start
📈 Roadmap / Future Enhancements
📱 Mobile app (React Native)

🎥 Video conferencing inside study rooms

📅 Calendar integration for planning

📊 Advanced analytics for learning patterns

🗂️ Export notes in multiple formats

📶 Offline support (PWA)

🎓 Educational Value
Study Buddy makes studying organized, engaging, and collaborative by combining:

AI efficiency – Summarize, quiz, explain

Collaboration – Real-time study rooms

Motivation – Streaks, badges & progress

Accessibility – Multi-format file support

🤝 Contributing
Contributions, issues, and feature requests are welcome!
Feel free to open a PR or raise an issue to make Study Buddy even better.

📜 License
MIT License

🌟 Show Your Support
If you like this project, star the repo ⭐ and stay tuned for deployment updates!

yaml
Copy code
