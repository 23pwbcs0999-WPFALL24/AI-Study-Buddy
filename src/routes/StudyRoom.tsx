// import { useCallback, useState, useEffect, useRef } from 'react'
// import { useSocket } from '@/hooks/useSocket'
// import { useNavigate } from "react-router-dom";
// import { useParams } from "react-router-dom";
// interface StudySession {
//   id: string
//   name: string
//   duration: number
//   isActive: boolean
//   startTime?: Date
// }

// interface Message {
//   id: string
//   user: string
//   text: string
//   timestamp: Date
//   type: 'message' | 'join' | 'leave' | 'focus'
// }

// export default function StudyRoom() {
//   const { code } = useParams();
//   const [roomId, setRoomId] = useState(code || "public-room");
//   // const [roomId, setRoomId] = useState('public-room')
//   const [messages, setMessages] = useState<Message[]>([])
//   const [input, setInput] = useState('')
//   const [username, setUsername] = useState('')
//   const [isConnected, setIsConnected] = useState(false)
//   const [socketReady, setSocketReady] = useState(false)
//   const [activeUsers, setActiveUsers] = useState<string[]>([])
//   const [studySessions, setStudySessions] = useState<StudySession[]>([])
//   const [currentSession, setCurrentSession] = useState<StudySession | null>(null)
//   const [timeLeft, setTimeLeft] = useState(0)
//   const [isFocusMode, setIsFocusMode] = useState(false)
//   const [showSettings, setShowSettings] = useState(false)
  
//   const socketRef = useSocket(roomId, username, handleMessage)
//   const timerRef = useRef<NodeJS.Timeout | null>(null)
//   const navigate = useNavigate();

//   // Listen for socket connection status
//   useEffect(() => {
//     const socket = socketRef.current;
//     if (!socket) return;

//     const handleConnect = () => {
//       console.log('Socket connected in StudyRoom');
//       setSocketReady(true);
//     };
//     const handleDisconnect = () => {
//       console.log('Socket disconnected in StudyRoom');
//       setSocketReady(false);
//       setIsConnected(false);
//     };

//     socket.on('connect', handleConnect);
//     socket.on('disconnect', handleDisconnect);

//     // Set initial state if already connected
//     if (socket.connected) setSocketReady(true);

//     return () => {
//       socket.off('connect', handleConnect);
//       socket.off('disconnect', handleDisconnect);
//     };
//   }, [socketRef.current, roomId])

//   const predefinedSessions: StudySession[] = [
//     { id: 'pomodoro', name: 'Pomodoro (25min)', duration: 25 * 60, isActive: false },
//     { id: 'short-break', name: 'Short Break (5min)', duration: 5 * 60, isActive: false },
//     { id: 'long-break', name: 'Long Break (15min)', duration: 15 * 60, isActive: false },
//     { id: 'deep-focus', name: 'Deep Focus (50min)', duration: 50 * 60, isActive: false },
//     { id: 'quick-study', name: 'Quick Study (15min)', duration: 15 * 60, isActive: false },
//   ]

//   useEffect(() => {
//     // Generate random username if not set
//     if (!username) {
//       setUsername(`Student${Math.floor(Math.random() * 1000)}`)
//     }
//   }, [username])

//   // Auto-join room when socket is ready and username is set
//   useEffect(() => {
//     if (
//       socketRef.current &&
//       socketRef.current.connected &&
//       username &&
//       !isConnected
//     ) {
//       socketRef.current.emit('join-room', roomId, 'me', username)
//       setIsConnected(true)
//     }
//   }, [socketRef.current?.connected, username, isConnected, roomId])

//   useEffect(() => {
//     if (currentSession && currentSession.isActive) {
//       timerRef.current = setInterval(() => {
//         setTimeLeft(prev => {
//           if (prev <= 1) {
//             if (timerRef.current) {
//               clearInterval(timerRef.current)
//             }
//             handleSessionComplete()
//             return 0
//           }
//           return prev - 1
//         })
//       }, 1000)
//     }

//     return () => {
//       if (timerRef.current) {
//         clearInterval(timerRef.current)
//       }
//     }
//   }, [currentSession])

//   function handleMessage(data: any) {
//     const message: Message = {
//       id: Date.now().toString() + Math.random().toString(36).slice(2),
//       user: data.username || data.userId,
//       text: data.message,
//       timestamp: data.timestamp ? new Date(data.timestamp) : new Date(),
//       type: data.type || 'message'
//     }
//     setMessages(prev => [...prev, message])

//     if (data.type === 'join') {
//       setActiveUsers(prev => [...new Set([...prev, data.username])])
//     } else if (data.type === 'leave') {
//       setActiveUsers(prev => prev.filter(user => user !== data.username))
//     }
//   }

//   function sendMessage() {
//     const msg = input.trim()
//     if (!msg || !socketRef.current) {
//       console.log('Cannot send message:', { msg: !!msg, socket: !!socketRef.current })
//       return
//     }
    
//     // Check if socket is connected
//     if (!socketRef.current.connected) {
//       console.log('Socket not connected, attempting to reconnect...')
//       socketRef.current.connect()
//       return
//     }
    
//     // Check if we're connected to the room
//     if (!isConnected) {
//       console.log('Not connected to room, attempting to join...')
//       joinRoom()
//       return
//     }
    
//     const payload = { 
//       roomId, 
//       userId: 'me', 
//       username, 
//       message: msg,
//       type: 'message'
//     }
    
//     console.log('Sending message:', payload)
//     socketRef.current.emit('chat-message', payload)
//     setInput('')
//   }

//   function joinRoom() {
//     if (!socketRef.current || !username.trim()) {
//       console.log('Cannot join room:', { socket: !!socketRef.current, username: !!username.trim() })
//       return
//     }

//     // Check if socket is connected
//     if (!socketRef.current.connected) {
//       console.log('Socket not connected, attempting to connect...')
//       socketRef.current.connect()
//       return
//     }

//     socketRef.current.emit('join-room', roomId, 'me', username)
//     setIsConnected(true)
//     setActiveUsers(prev => [...new Set([...prev, username])])
//   }

//   // Leave room handler
//   function leaveRoom() {
//     if (!socketRef.current) return;
//     socketRef.current.emit('leave-room', roomId, 'me', username);
//     socketRef.current.disconnect();
//     setIsConnected(false);
//     setActiveUsers(prev => prev.filter(user => user !== username));
//     navigate("/dashboard"); // or your desired route
//   }

//   function startSession(session: StudySession) {
//     const newSession: StudySession = {
//       ...session,
//       id: Date.now().toString(),
//       isActive: true,
//       startTime: new Date()
//     }
    
//     setCurrentSession(newSession)
//     setTimeLeft(session.duration)
//     setStudySessions(prev => [...prev, newSession])
    
//     // Notify others
//     if (socketRef.current) {
//       const payload = {
//         roomId,
//         userId: 'me',
//         username,
//         message: `${username} started a ${session.name} session`,
//         type: 'focus'
//       }
//       socketRef.current.emit('chat-message', payload)
//     }
//   }

//   function pauseSession() {
//     if (currentSession) {
//       setCurrentSession({ ...currentSession, isActive: false })
//       if (timerRef.current) {
//         clearInterval(timerRef.current)
//       }
//     }
//   }

//   function resumeSession() {
//     if (currentSession) {
//       setCurrentSession({ ...currentSession, isActive: true })
//     }
//   }

//   function stopSession() {
//     if (currentSession) {
//       setCurrentSession(null)
//       setTimeLeft(0)
//       if (timerRef.current) {
//         clearInterval(timerRef.current)
//       }
//     }
//   }

//   function handleSessionComplete() {
//     setCurrentSession(null)
//     setTimeLeft(0)
    
//     // Play notification sound
//     const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT')
//     audio.play()
    
//     // Send completion message
//     if (socketRef.current) {
//       const payload = {
//         roomId,
//         userId: 'me',
//         username,
//         message: `${username} completed their study session!`,
//         type: 'message'
//       }
//       socketRef.current.emit('chat-message', payload)
//     }
//   }

//   function formatTime(seconds: number): string {
//     const mins = Math.floor(seconds / 60)
//     const secs = seconds % 60
//     return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
//   }

//   function toggleFocusMode() {
//     setIsFocusMode(!isFocusMode)
//   }

//   return (
//     <div className="space-y-6">
//      {/* Header */}
// <div className="flex items-center justify-between">
//   <div>
//     <h1 className="text-3xl font-bold text-white">Study Room</h1>
//     <p className="text-white/60 mt-1">
//       Collaborative study environment with focus tools
//     </p>
//   </div>
//   <div className="flex items-center gap-4">
//     <button
//       onClick={toggleFocusMode}
//       className={`button ${
//         isFocusMode
//           ? "bg-green-600 hover:bg-green-700"
//           : "bg-white/10 hover:bg-white/20"
//       }`}
//     >
//       {isFocusMode ? "🔴 Exit Focus" : "🟢 Focus Mode"}
//     </button>

//     {/* ✅ Copy Invite Link button */}
//     <button
//       onClick={() => {
//         navigator.clipboard.writeText(window.location.href);
//         alert("Room link copied! Share it with your friend 🚀");
//       }}
//       className="button bg-blue-600 hover:bg-blue-700"
//     >
//       🔗 Copy Invite Link
//     </button>

//     <button
//       onClick={() => setShowSettings(!showSettings)}
//       className="button bg-white/10 hover:bg-white/20"
//     >
//       ⚙️ Settings
//     </button>
//   </div>
// </div>
//////////
import { useState, useEffect, useRef, useCallback } from "react";
import { useSocket } from "@/hooks/useSocket";
import { useNavigate, useParams } from "react-router-dom";

interface StudySession {
  id: string;
  name: string;
  duration: number;
  isActive: boolean;
  startTime?: Date;
}

interface Message {
  id: string;
  user: string;
  text: string;
  timestamp: Date;
  type: "message" | "join" | "leave" | "focus";
}

export default function StudyRoom() {
  const { code } = useParams<{ code: string }>();
  const [roomId, setRoomId] = useState(code || "public-room");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [username, setUsername] = useState("");
  const [userId] = useState(() => crypto.randomUUID());
  const [activeUsers, setActiveUsers] = useState<string[]>([]);
  const [studySessions, setStudySessions] = useState<StudySession[]>([]);
  const [currentSession, setCurrentSession] = useState<StudySession | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const navigate = useNavigate();

  // Handle chat + join/leave
  const handleMessage = useCallback((data: any) => {
    const message: Message = {
      id: Date.now().toString() + Math.random().toString(36).slice(2),
      user: data.username || data.userId,
      text: data.message,
      timestamp: data.timestamp ? new Date(data.timestamp) : new Date(),
      type: data.type || "message",
    };
    setMessages((prev) => [...prev, message]);

    if (data.type === "join") {
      setActiveUsers((prev) => [...new Set([...prev, data.username])]);
    } else if (data.type === "leave") {
      setActiveUsers((prev) => prev.filter((user) => user !== data.username));
    }
  }, []);

  const socketRef = useSocket(roomId, userId, username, handleMessage);

  const predefinedSessions: StudySession[] = [
    { id: "pomodoro", name: "Pomodoro (25min)", duration: 25 * 60, isActive: false },
    { id: "short-break", name: "Short Break (5min)", duration: 5 * 60, isActive: false },
    { id: "long-break", name: "Long Break (15min)", duration: 15 * 60, isActive: false },
    { id: "deep-focus", name: "Deep Focus (50min)", duration: 50 * 60, isActive: false },
    { id: "quick-study", name: "Quick Study (15min)", duration: 15 * 60, isActive: false },
  ];

  useEffect(() => {
    if (!username) setUsername(`Student${Math.floor(Math.random() * 1000)}`);
  }, [username]);

  // ✅ Listen for "session-started" broadcast from server
  useEffect(() => {
    if (!socketRef.current) return;

    const handleSessionStarted = (data: {
      sessionType: string;
      duration: number;
      endTime: number;
      startedBy: string;
    }) => {
      setCurrentSession({
        id: Date.now().toString(),
        name: data.sessionType,
        duration: data.duration,
        isActive: true,
        startTime: new Date(),
      });

      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        const remaining = Math.max(
          0,
          Math.floor((data.endTime - Date.now()) / 1000)
        );
        setTimeLeft(remaining);
        if (remaining <= 0 && timerRef.current) {
          clearInterval(timerRef.current);
          setCurrentSession(null);
        }
      }, 1000);

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          user: data.startedBy,
          text: `started a ${data.sessionType} session`,
          timestamp: new Date(),
          type: "focus",
        },
      ]);
    };

    socketRef.current.on("session-started", handleSessionStarted);
    return () => {
      socketRef.current?.off("session-started", handleSessionStarted);
    };
  }, [socketRef]);

  function sendMessage() {
    const msg = input.trim();
    if (!msg || !socketRef.current) return;

    socketRef.current.emit("chat-message", {
      roomId,
      userId,
      username,
      message: msg,
      type: "message",
    });
    setInput("");
  }

  function leaveRoom() {
    if (!socketRef.current) return;
    socketRef.current.emit("leave-room", roomId, userId, username);
    socketRef.current.disconnect();
    setActiveUsers((prev) => prev.filter((user) => user !== username));
    navigate("/dashboard");
  }

  // ✅ Emit dedicated "start-session" instead of chat-message
  function startSession(session: StudySession) {
    const newSession: StudySession = {
      ...session,
      id: Date.now().toString(),
      isActive: true,
      startTime: new Date(),
    };
    setCurrentSession(newSession);
    setTimeLeft(session.duration);
    setStudySessions((prev) => [...prev, newSession]);

    if (socketRef.current) {
      socketRef.current.emit("start-session", {
        roomId,
        sessionType: session.name,
        duration: session.duration,
        startedBy: username,
      });
    }
  }

  function pauseSession() {
    if (currentSession) {
      setCurrentSession({ ...currentSession, isActive: false });
      if (timerRef.current) clearInterval(timerRef.current);
    }
  }

  function resumeSession() {
    if (currentSession) setCurrentSession({ ...currentSession, isActive: true });
  }

  function stopSession() {
    if (currentSession) {
      setCurrentSession(null);
      setTimeLeft(0);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  }

  function handleSessionComplete() {
    setCurrentSession(null);
    setTimeLeft(0);
    if (socketRef.current) {
      socketRef.current.emit("chat-message", {
        roomId,
        userId,
        username,
        message: `${username} completed their study session!`,
        type: "message",
      });
    }
  }

  function formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Study Room</h1>
          <p className="text-white/60 mt-1">Collaborative study environment</p>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsFocusMode(!isFocusMode)}
            className={`button ${
              isFocusMode ? "bg-green-600 hover:bg-green-700" : "bg-white/10 hover:bg-white/20"
            }`}
          >
            {isFocusMode ? "🔴 Exit Focus" : "🟢 Focus Mode"}
          </button>
          <button
            onClick={() => {
              navigator.clipboard.writeText(window.location.href);
              alert("Room link copied! 🚀");
            }}
            className="button bg-blue-600 hover:bg-blue-700"
          >
            🔗 Copy Invite Link
          </button>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="button bg-white/10 hover:bg-white/20"
          >
            ⚙️ Settings
          </button>
        </div>
      </div>

      {/* Connection Panel */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Room Settings</h3>
        <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
          <input
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            className="w-full px-4 py-2 rounded-lg bg-white/5 text-white"
            placeholder="Room ID"
          />
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-4 py-2 rounded-lg bg-white/5 text-white"
            placeholder="Your name"
          />
          <button onClick={leaveRoom} className="button bg-red-600 hover:bg-red-700">
            🚪 Leave Room
          </button>
        </div>
      </div>

      {/* Active Users */}
      <div className="card p-4">
        <h3 className="text-lg font-semibold text-white mb-2">Active Users</h3>
        <div className="flex flex-wrap gap-2">
          {activeUsers.map((u) => (
            <span key={u} className="px-3 py-1 bg-white/10 rounded-full text-white text-sm">
              {u}
            </span>
          ))}
        </div>
      </div>

      {/* Timer + Sessions */}
      <div className="card p-4">
        <h3 className="text-lg font-semibold text-white mb-2">Study Sessions</h3>
        {currentSession ? (
          <div className="space-y-2">
            <p className="text-white">⏳ {currentSession.name}: {formatTime(timeLeft)}</p>
            <div className="flex gap-2">
              <button onClick={pauseSession} className="button bg-yellow-600 hover:bg-yellow-700">⏸ Pause</button>
              <button onClick={resumeSession} className="button bg-green-600 hover:bg-green-700">▶ Resume</button>
              <button onClick={stopSession} className="button bg-red-600 hover:bg-red-700">⏹ Stop</button>
            </div>
          </div>
        ) : (
          <div className="grid gap-2 grid-cols-2 md:grid-cols-3">
            {predefinedSessions.map((s) => (
              <button
                key={s.id}
                onClick={() => startSession(s)}
                className="button bg-white/10 hover:bg-white/20"
              >
                {s.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Chat */}
      <div className="card p-4 space-y-4">
        <h3 className="text-lg font-semibold text-white">Chat</h3>
        <div className="h-64 overflow-y-auto bg-black/20 rounded-lg p-2 space-y-2">
          {messages.map((m) => {
            if (m.type === "focus") {
              return (
                <div key={m.id} className="text-blue-400 font-semibold">
                  ⏳ {m.text}
                </div>
              );
            }
            if (m.type === "join") {
              return (
                <div key={m.id} className="text-green-400 italic">
                  ✅ {m.text}
                </div>
              );
            }
            if (m.type === "leave") {
              return (
                <div key={m.id} className="text-red-400 italic">
                  🚪 {m.text}
                </div>
              );
            }
            return (
              <div key={m.id} className="text-white/90">
                <strong>{m.user}: </strong>
                <span>{m.text}</span>
              </div>
            );
          })}
        </div>
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 px-4 py-2 rounded-lg bg-white/5 text-white"
            placeholder="Type a message..."
          />
          <button onClick={sendMessage} className="button bg-blue-600 hover:bg-blue-700">
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
