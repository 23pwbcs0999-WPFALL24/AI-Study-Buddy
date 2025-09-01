import { useState, useEffect, useRef } from "react";
import { useSocket } from "@/hooks/useSocket";
import { useNavigate, useLocation } from "react-router-dom";

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
  type: "message" | "focus" | "join" | "leave";
}

export default function StudyRoom() {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const codeParam = queryParams.get("code");
  const code = codeParam && codeParam !== "undefined" ? codeParam : "";

  const [roomId, setRoomId] = useState(code);
  const [roomName, setRoomName] = useState("");
  const [username, setUsername] = useState("");
  const [joined, setJoined] = useState(false);

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [activeUsers, setActiveUsers] = useState<string[]>([]);
  const [studySessions, setStudySessions] = useState<StudySession[]>([]);
  const [currentSession, setCurrentSession] = useState<StudySession | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const navigate = useNavigate();
  const [userId] = useState(() => crypto.randomUUID());

  // --- SOCKET ---
  const socketRef = useSocket(
    joined && roomId && username ? roomId : "",
    joined && roomId && username ? userId : "",
    joined && roomId && username ? username : "",
    handleMessage
  );

  function handleMessage(event: { type: string; data?: any }) {
    const data = event.data || {};
    if (event.type === "active-users") {
      setActiveUsers((data || []).map((u: any) => u.username || u.userId || "Unknown"));
      return;
    }
    if (event.type === "session-started") {
      const rem = Math.max(0, Math.floor((data.endTime - Date.now()) / 1000));
      setCurrentSession({
        id: data.sessionId,
        name: data.sessionName,
        duration: data.duration,
        isActive: true,
        startTime: new Date(),
      });
      setTimeLeft(rem);

      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        const newRem = Math.max(0, Math.floor((data.endTime - Date.now()) / 1000));
        setTimeLeft(newRem);
        if (newRem <= 0 && timerRef.current) {
          clearInterval(timerRef.current);
          setCurrentSession(null);
        }
      }, 1000);

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          user: data.startedBy,
          text: `started a ${data.sessionName} session`,
          timestamp: new Date(),
          type: "focus",
        },
      ]);
      return;
    }
    if (event.type === "session-stopped") {
      if (timerRef.current) clearInterval(timerRef.current);
      setCurrentSession(null);
      setTimeLeft(0);
      return;
    }
    const message: Message = {
      id: Date.now().toString() + Math.random().toString(36).slice(2),
      user: data.username || data.user || data.userId || data.startedBy || "Unknown",
      text: data.message || data.text,
      timestamp: data.timestamp ? new Date(data.timestamp) : new Date(),
      type: data.type || event.type || "message",
    };
    setMessages((prev) => [...prev, message]);
  }

  const predefinedSessions: StudySession[] = [
    { id: "pomodoro", name: "Pomodoro (25min)", duration: 25 * 60, isActive: false },
    { id: "short-break", name: "Short Break (5min)", duration: 5 * 60, isActive: false },
    { id: "long-break", name: "Long Break (15min)", duration: 15 * 60, isActive: false },
    { id: "deep-focus", name: "Deep Focus (50min)", duration: 50 * 60, isActive: false },
    { id: "quick-study", name: "Quick Study (15min)", duration: 15 * 60, isActive: false },
  ];

  // --- Session listeners ---
  useEffect(() => {
    if (!socketRef.current) return;

    const handleSessionStarted = (data: {
      sessionId: string;
      sessionName: string;
      duration: number;
      endTime: number;
      startedBy: string;
    }) => {
      const rem = Math.max(0, Math.floor((data.endTime - Date.now()) / 1000));
      setCurrentSession({
        id: data.sessionId,
        name: data.sessionName,
        duration: data.duration,
        isActive: true,
        startTime: new Date(),
      });
      setTimeLeft(rem);

      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        const newRem = Math.max(0, Math.floor((data.endTime - Date.now()) / 1000));
        setTimeLeft(newRem);
        if (newRem <= 0 && timerRef.current) {
          clearInterval(timerRef.current);
          setCurrentSession(null);
        }
      }, 1000);

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          user: data.startedBy,
          text: `started a ${data.sessionName} session`,
          timestamp: new Date(),
          type: "focus",
        },
      ]);
    };

    const handleSessionStopped = () => {
      if (timerRef.current) clearInterval(timerRef.current);
      setCurrentSession(null);
      setTimeLeft(0);
    };

    socketRef.current.on("session-started", handleSessionStarted);
    socketRef.current.on("session-stopped", handleSessionStopped);

    return () => {
      socketRef.current?.off("session-started", handleSessionStarted);
      socketRef.current?.off("session-stopped", handleSessionStopped);
    };
  }, [socketRef]);

  // --- Messaging ---
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

  // --- Leave Room ---
  function leaveRoom() {
    if (socketRef.current) {
      socketRef.current.emit("leave-room", {
        roomId,
        userId,
        username,
      });
      socketRef.current.disconnect();
    }
    if (timerRef.current) clearInterval(timerRef.current);

    setActiveUsers([]);
    setJoined(false);
    setCurrentSession(null);
    setMessages([]);
    setTimeLeft(0);

    navigate("/dashboard");
  }

  // --- Session controls ---
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

    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          setCurrentSession(null);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    if (socketRef.current) {
      socketRef.current.emit("start-session", {
        roomId,
        sessionId: newSession.id,
        sessionName: session.name,
        duration: session.duration,
        startedBy: username,
      });
    }
  }

  function stopSession() {
    if (currentSession && socketRef.current) {
      socketRef.current.emit("stop-session", {
        roomId,
        stoppedBy: username,
      });
    }
    if (timerRef.current) clearInterval(timerRef.current);
    setCurrentSession(null);
    setTimeLeft(0);
  }

  function formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }

  // --- Create/Join UI ---
  if (!joined) {
    if (code) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
          <div className="card p-8 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4 text-white">Enter Your Name to Join Room</h2>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-white/5 text-white mb-4"
              placeholder="Your name"
            />
            <button
              className="button bg-green-600 hover:bg-green-700 w-full"
              onClick={() => {
                if (username && code) {
                  setRoomId(code);
                  setJoined(true);
                }
              }}
            >
              Join Room
            </button>
          </div>
        </div>
      );
    }
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
        <div className="card p-8 w-full max-w-md">
          <h2 className="text-2xl font-bold mb-4 text-white">Create a Study Room</h2>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-4 py-2 rounded-lg bg-white/5 text-white mb-4"
            placeholder="Your name"
          />
          <input
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
            className="w-full px-4 py-2 rounded-lg bg-white/5 text-white mb-4"
            placeholder="Room name"
          />
          <button
            className="button bg-blue-600 hover:bg-blue-700 w-full"
            onClick={async () => {
              if (username && roomName) {
                const res = await fetch("/api/studyrooms/create", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ name: roomName }),
                  credentials: "include",
                });
                const data = await res.json();
                const newCode = data.code || data.room?.code;
                if (newCode) {
                  setRoomId(newCode);
                  setJoined(true);
                  window.history.replaceState({}, "", `/dashboard/study-room?code=${newCode}`);
                } else {
                  alert("Error: No room code received from server");
                }
              }
            }}
          >
            Create Room
          </button>
        </div>
      </div>
    );
  }

  // --- Main Room UI ---
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
              if (roomId && roomId !== "undefined") {
                navigator.clipboard.writeText(
                  `${window.location.origin}/dashboard/study-room?code=${roomId}`
                );
                alert("Room link copied! 🚀");
              } else {
                alert("Room ID is not set yet.");
              }
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

      {/* Room Settings */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Room Settings</h3>
        <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
          <input
            value={roomId}
            disabled
            className="w-full px-4 py-2 rounded-lg bg-white/5 text-white"
            placeholder="Room ID"
          />
          <input
            value={username}
            disabled
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
          {activeUsers.map((u, idx) => (
            <span key={u + idx} className="px-3 py-1 bg-white/10 rounded-full text-white text-sm">
              {u}
            </span>
          ))}
        </div>
      </div>

      {/* Sessions */}
      <div className="card p-4">
        <h3 className="text-lg font-semibold text-white mb-2">Study Sessions</h3>
        {currentSession ? (
          <div className="space-y-2">
            <p className="text-white">
              ⏳ {currentSession.name}: {formatTime(timeLeft)}
            </p>
            <div className="flex gap-2">
              <button onClick={stopSession} className="button bg-red-600 hover:bg-red-700">
                ⏹ Stop
              </button>
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
                  ⏳ <strong>{m.user}</strong> {m.text}
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
