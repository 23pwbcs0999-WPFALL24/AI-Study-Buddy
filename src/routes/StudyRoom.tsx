import { useCallback, useState, useEffect, useRef } from 'react'
import { useSocket } from '@/hooks/useSocket'
import { useNavigate } from "react-router-dom";

interface StudySession {
  id: string
  name: string
  duration: number
  isActive: boolean
  startTime?: Date
}

interface Message {
  id: string
  user: string
  text: string
  timestamp: Date
  type: 'message' | 'join' | 'leave' | 'focus'
}

export default function StudyRoom() {
  const [roomId, setRoomId] = useState('public-room')
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [username, setUsername] = useState('')
  const [isConnected, setIsConnected] = useState(false)
  const [socketReady, setSocketReady] = useState(false)
  const [activeUsers, setActiveUsers] = useState<string[]>([])
  const [studySessions, setStudySessions] = useState<StudySession[]>([])
  const [currentSession, setCurrentSession] = useState<StudySession | null>(null)
  const [timeLeft, setTimeLeft] = useState(0)
  const [isFocusMode, setIsFocusMode] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  
  const socketRef = useSocket(roomId, username, handleMessage)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const navigate = useNavigate();

  // Listen for socket connection status
  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;

    const handleConnect = () => {
      console.log('Socket connected in StudyRoom');
      setSocketReady(true);
    };
    const handleDisconnect = () => {
      console.log('Socket disconnected in StudyRoom');
      setSocketReady(false);
      setIsConnected(false);
    };

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);

    // Set initial state if already connected
    if (socket.connected) setSocketReady(true);

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
    };
  }, [socketRef.current, roomId])

  const predefinedSessions: StudySession[] = [
    { id: 'pomodoro', name: 'Pomodoro (25min)', duration: 25 * 60, isActive: false },
    { id: 'short-break', name: 'Short Break (5min)', duration: 5 * 60, isActive: false },
    { id: 'long-break', name: 'Long Break (15min)', duration: 15 * 60, isActive: false },
    { id: 'deep-focus', name: 'Deep Focus (50min)', duration: 50 * 60, isActive: false },
    { id: 'quick-study', name: 'Quick Study (15min)', duration: 15 * 60, isActive: false },
  ]

  useEffect(() => {
    // Generate random username if not set
    if (!username) {
      setUsername(`Student${Math.floor(Math.random() * 1000)}`)
    }
  }, [username])

  // Auto-join room when socket is ready and username is set
  useEffect(() => {
    if (
      socketRef.current &&
      socketRef.current.connected &&
      username &&
      !isConnected
    ) {
      socketRef.current.emit('join-room', roomId, 'me', username)
      setIsConnected(true)
    }
  }, [socketRef.current?.connected, username, isConnected, roomId])

  useEffect(() => {
    if (currentSession && currentSession.isActive) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            if (timerRef.current) {
              clearInterval(timerRef.current)
            }
            handleSessionComplete()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [currentSession])

  function handleMessage(data: any) {
    const message: Message = {
      id: Date.now().toString() + Math.random().toString(36).slice(2),
      user: data.username || data.userId,
      text: data.message,
      timestamp: data.timestamp ? new Date(data.timestamp) : new Date(),
      type: data.type || 'message'
    }
    setMessages(prev => [...prev, message])

    if (data.type === 'join') {
      setActiveUsers(prev => [...new Set([...prev, data.username])])
    } else if (data.type === 'leave') {
      setActiveUsers(prev => prev.filter(user => user !== data.username))
    }
  }

  function sendMessage() {
    const msg = input.trim()
    if (!msg || !socketRef.current) {
      console.log('Cannot send message:', { msg: !!msg, socket: !!socketRef.current })
      return
    }
    
    // Check if socket is connected
    if (!socketRef.current.connected) {
      console.log('Socket not connected, attempting to reconnect...')
      socketRef.current.connect()
      return
    }
    
    // Check if we're connected to the room
    if (!isConnected) {
      console.log('Not connected to room, attempting to join...')
      joinRoom()
      return
    }
    
    const payload = { 
      roomId, 
      userId: 'me', 
      username, 
      message: msg,
      type: 'message'
    }
    
    console.log('Sending message:', payload)
    socketRef.current.emit('chat-message', payload)
    setInput('')
  }

  function joinRoom() {
    if (!socketRef.current || !username.trim()) {
      console.log('Cannot join room:', { socket: !!socketRef.current, username: !!username.trim() })
      return
    }

    // Check if socket is connected
    if (!socketRef.current.connected) {
      console.log('Socket not connected, attempting to connect...')
      socketRef.current.connect()
      return
    }

    socketRef.current.emit('join-room', roomId, 'me', username)
    setIsConnected(true)
    setActiveUsers(prev => [...new Set([...prev, username])])
  }

  // Leave room handler
  function leaveRoom() {
    if (!socketRef.current) return;
    socketRef.current.emit('leave-room', roomId, 'me', username);
    socketRef.current.disconnect();
    setIsConnected(false);
    setActiveUsers(prev => prev.filter(user => user !== username));
    navigate("/dashboard"); // or your desired route
  }

  function startSession(session: StudySession) {
    const newSession: StudySession = {
      ...session,
      id: Date.now().toString(),
      isActive: true,
      startTime: new Date()
    }
    
    setCurrentSession(newSession)
    setTimeLeft(session.duration)
    setStudySessions(prev => [...prev, newSession])
    
    // Notify others
    if (socketRef.current) {
      const payload = {
        roomId,
        userId: 'me',
        username,
        message: `${username} started a ${session.name} session`,
        type: 'focus'
      }
      socketRef.current.emit('chat-message', payload)
    }
  }

  function pauseSession() {
    if (currentSession) {
      setCurrentSession({ ...currentSession, isActive: false })
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }

  function resumeSession() {
    if (currentSession) {
      setCurrentSession({ ...currentSession, isActive: true })
    }
  }

  function stopSession() {
    if (currentSession) {
      setCurrentSession(null)
      setTimeLeft(0)
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }

  function handleSessionComplete() {
    setCurrentSession(null)
    setTimeLeft(0)
    
    // Play notification sound
    const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT')
    audio.play()
    
    // Send completion message
    if (socketRef.current) {
      const payload = {
        roomId,
        userId: 'me',
        username,
        message: `${username} completed their study session!`,
        type: 'message'
      }
      socketRef.current.emit('chat-message', payload)
    }
  }

  function formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  function toggleFocusMode() {
    setIsFocusMode(!isFocusMode)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Study Room</h1>
          <p className="text-white/60 mt-1">Collaborative study environment with focus tools</p>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={toggleFocusMode}
            className={`button ${isFocusMode ? 'bg-green-600 hover:bg-green-700' : 'bg-white/10 hover:bg-white/20'}`}
          >
            {isFocusMode ? '🔴 Exit Focus' : '🟢 Focus Mode'}
          </button>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="button bg-white/10 hover:bg-white/20"
          >
            ⚙️ Settings
          </button>
        </div>
      </div>

      {/* Room Connection Section */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Room Connection</h3>
        <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
          <div>
            <label className="text-sm font-medium text-white/80 mb-2 block">Room ID</label>
            <input
              type="text"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-white/10 bg-white/5 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-white/80 mb-2 block">Your Name</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-white/10 bg-white/5 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div className="flex items-end">
            {!isConnected ? (
              <button
                onClick={joinRoom}
                className="w-full button bg-purple-600 hover:bg-purple-700"
              >
                🚀 Join Room
              </button>
            ) : (
              <button
                onClick={leaveRoom}
                className="w-full button bg-red-600 hover:bg-red-700"
              >
                🚪 Leave Room
              </button>
            )}
          </div>
        </div>
        {!socketReady && (
          <div className="mt-4 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
            <div className="flex items-center gap-2 text-yellow-400">
              <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
              Connecting to server...
            </div>
          </div>
        )}
        {socketReady && !isConnected && (
          <div className="mt-4 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
            <div className="flex items-center gap-2 text-blue-400">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
              Connecting to room: {roomId}...
            </div>
          </div>
        )}
        {isConnected && (
          <div className="mt-4 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
            <div className="flex items-center gap-2 text-green-400">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              Connected to room: {roomId}
            </div>
          </div>
        )}
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Additional Settings</h3>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-white/80 mb-2 block">Custom Room ID</label>
              <input
                type="text"
                placeholder="Enter custom room ID"
                className="w-full px-4 py-2 rounded-lg border border-white/10 bg-white/5 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-white/80 mb-2 block">Study Preferences</label>
              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="rounded" />
                  <span className="text-sm text-white/80">Enable notifications</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="rounded" />
                  <span className="text-sm text-white/80">Auto-join on startup</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
        {/* Study Timer */}
        <div className="space-y-4">
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Study Timer</h3>
            
            {currentSession ? (
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-4xl font-bold text-white mb-2">
                    {formatTime(timeLeft)}
                  </div>
                  <div className="text-white/60">{currentSession.name}</div>
                </div>
                
                <div className="flex gap-2">
                  {currentSession.isActive ? (
                    <button
                      onClick={pauseSession}
                      className="flex-1 button bg-yellow-600 hover:bg-yellow-700"
                    >
                      ⏸️ Pause
                    </button>
                  ) : (
                    <button
                      onClick={resumeSession}
                      className="flex-1 button bg-green-600 hover:bg-green-700"
                    >
                      ▶️ Resume
                    </button>
                  )}
                  <button
                    onClick={stopSession}
                    className="flex-1 button bg-red-600 hover:bg-red-700"
                  >
                    ⏹️ Stop
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-center py-8 text-white/60">
                  <div className="text-4xl mb-2">⏱️</div>
                  <p>No active session</p>
                </div>
                
                <div className="space-y-2">
                  {predefinedSessions.map((session) => (
                    <button
                      key={session.id}
                      onClick={() => startSession(session)}
                      className="w-full button bg-white/10 hover:bg-white/20 text-left"
                    >
                      <div className="font-medium text-white">{session.name}</div>
                      <div className="text-sm text-white/60">
                        {Math.floor(session.duration / 60)} minutes
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Active Users */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Active Users ({activeUsers.length})</h3>
            <div className="space-y-2">
              {activeUsers.map((user, i) => (
                <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-white/5">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-white">{user}</span>
                  {user === username && (
                    <span className="text-xs text-white/60">(You)</span>
                  )}
                </div>
              ))}
              {activeUsers.length === 0 && (
                <div className="text-center text-white/60 py-4">
                  No active users
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Chat Area */}
        <div className="lg:col-span-2 space-y-4">
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Study Chat</h3>
            
            <div className="h-96 overflow-y-auto border border-white/10 rounded-lg p-4 bg-white/5 mb-4">
              {!socketReady ? (
                <div>Connecting to server...</div>
              ) : !isConnected ? (
                <div>Joining study room...</div>
              ) : messages.length === 0 ? (
                <div>No messages yet</div>
              ) : (
                <div className="space-y-3">
                  {messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.user === username ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] p-3 rounded-lg ${
                        msg.type === 'join' || msg.type === 'leave'
                          ? 'bg-blue-500/20 text-blue-300 text-center'
                          : msg.type === 'focus'
                          ? 'bg-purple-500/20 text-purple-300 text-center'
                          : msg.user === username
                          ? 'bg-purple-600 text-white'
                          : 'bg-white/10 text-white'
                      }`}>
                        {msg.type === 'message' && (
                          <div className="text-sm font-medium mb-1">
                            {msg.user === username ? 'You' : msg.user}
                          </div>
                        )}
                        <div className="whitespace-pre-wrap">{msg.text}</div>
                        <div className="text-xs opacity-60 mt-1">
                          {msg.timestamp.toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="flex gap-2">
              <input
                className="flex-1 px-4 py-2 rounded-lg border border-white/10 bg-white/5 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={
                  !socketReady ? "Connecting to server..." :
                  !isConnected ? "Joining room..." :
                  "Type a message..."
                }
                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                disabled={!isConnected}
              />
              <button
                onClick={sendMessage}
                disabled={!isConnected || !input.trim()}
                className="button bg-purple-600 hover:bg-purple-700 disabled:opacity-50"
                title={
                  !socketReady ? "Connecting to server..." :
                  !isConnected ? "Joining room..." :
                  "Send message"
                }
              >
                {!socketReady ? "🔌" : !isConnected ? "⏳" : "➤"}
              </button>
            </div>
          </div>

          {/* Study Tips */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Study Tips</h3>
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="text-2xl">🎯</div>
                  <div>
                    <div className="font-medium text-white">Set Clear Goals</div>
                    <div className="text-sm text-white/60">Define what you want to achieve in each session</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="text-2xl">⏰</div>
                  <div>
                    <div className="font-medium text-white">Use the Timer</div>
                    <div className="text-sm text-white/60">Stay focused with timed study sessions</div>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="text-2xl">🤝</div>
                  <div>
                    <div className="font-medium text-white">Collaborate</div>
                    <div className="text-sm text-white/60">Share insights and help each other learn</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="text-2xl">🧘</div>
                  <div>
                    <div className="font-medium text-white">Take Breaks</div>
                    <div className="text-sm text-white/60">Regular breaks improve retention and focus</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


