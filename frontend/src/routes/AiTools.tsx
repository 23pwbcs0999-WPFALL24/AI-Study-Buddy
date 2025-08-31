import { useState, useRef, useEffect } from 'react'

type Tool = 'summarize' | 'flashcards' | 'quiz' | 'chat' | 'explain'

interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export default function AiTools() {
  const [input, setInput] = useState("")
  const [tool, setTool] = useState<Tool>('chat')
  const [result, setResult] = useState("")
  const [loading, setLoading] = useState(false)
  const [chatHistory, setChatHistory] = useState<Message[]>([])
  const [savedResults, setSavedResults] = useState<Array<{tool: Tool, input: string, result: string, timestamp: Date}>>([])

  const chatEndRef = useRef<HTMLDivElement>(null)
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null

  const tools = [
    {
      id: 'chat' as Tool,
      name: 'AI Chat',
      description: 'Have a conversation with AI about any topic',
      icon: '💬',
      color: 'from-blue-500 to-cyan-500',
      placeholder: 'Ask me anything about your studies...'
    },
    {
      id: 'summarize' as Tool,
      name: 'Summarize',
      description: 'Create concise summaries of long texts',
      icon: '📝',
      color: 'from-purple-500 to-pink-500',
      placeholder: 'Paste text to summarize...'
    },
    {
      id: 'flashcards' as Tool,
      name: 'Flashcards',
      description: 'Generate study flashcards from content',
      icon: '🃏',
      color: 'from-green-500 to-emerald-500',
      placeholder: 'Enter content to create flashcards...'
    },
    {
      id: 'quiz' as Tool,
      name: 'Quiz Generator',
      description: 'Create practice quizzes from your notes',
      icon: '❓',
      color: 'from-orange-500 to-red-500',
      placeholder: 'Enter content to generate quiz questions...'
    },
    {
      id: 'explain' as Tool,
      name: 'Explain',
      description: 'Get detailed explanations of complex topics',
      icon: '🔍',
      color: 'from-indigo-500 to-purple-500',
      placeholder: 'Ask for an explanation of any concept...'
    },

  ]

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatHistory])

  const addToChatHistory = (role: 'user' | 'assistant', content: string) => {
    setChatHistory(prev => [...prev, { role, content, timestamp: new Date() }])
  }

  const saveResult = () => {
    if (result && input) {
      setSavedResults(prev => [{
        tool,
        input,
        result,
        timestamp: new Date()
      }, ...prev])
      setResult("")
    }
  }

  async function runTool() {
    if (!input.trim()) return
    
    setLoading(true)
    setResult("")
    
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
      if (!token) {
        setResult('Please login to use AI tools.')
        setLoading(false)
        return
      }

      if (tool === 'chat') {
        addToChatHistory('user', input)
      }

      if (tool === 'summarize' && input.trim().length < 100) {
        setResult('Please provide at least 100 characters to summarize.')
        setLoading(false)
        return
      }

      const payload = tool === 'chat' ? { message: input } : { text: input }
      const res = await fetch(`/api/ai/${tool}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      })
      
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data?.message || `Request failed (${res.status})`)
      }

      console.log('Tool:', tool, 'Response data:', data) // Debug log

      let display = ''
      if (tool === 'flashcards' && Array.isArray(data?.flashcards)) {
        display = data.flashcards
          .map((fc: any, idx: number) => `${idx + 1}. Q: ${fc.question}\n   A: ${fc.answer}`)
          .join('\n\n')
      } else if (tool === 'quiz' && Array.isArray(data?.quiz)) {
        display = data.quiz
          .map((q: any, idx: number) => `${idx + 1}. ${q.question}\n   Options: ${q.options?.join(', ')}`)
          .join('\n\n')
      } else if (tool === 'explain' && data?.explanation) {
        display = data.explanation
      } else if (tool === 'explain' && typeof data === 'string') {
        // Handle case where explanation might be returned as a string
        display = data
      } else if (data && typeof data === 'object' && data.success === true) {
        if (tool === 'chat' && data.response) {
          display = data.response
        } else if (tool === 'summarize' && data.summary) {
          display = data.summary
        } else if (tool === 'explain' && data.explanation) {
          display = data.explanation
        } else {
          display = JSON.stringify(data, null, 2)
        }
      } else {
        display = typeof data === 'string' ? data : (data.summary || data.response || data.result || JSON.stringify(data))
      }

      setResult(display)
      
      if (tool === 'chat') {
        addToChatHistory('assistant', display)
      }
      
    } catch (err: any) {
      const errorMsg = err.message
      setResult(errorMsg)
      if (tool === 'chat') {
        addToChatHistory('assistant', `Error: ${errorMsg}`)
      }
    } finally {
      setLoading(false)
    }
  }

  const currentTool = tools.find(t => t.id === tool)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">AI Tools</h1>
        <p className="text-white/60 mt-1">Powerful AI-powered study assistance</p>
      </div>

      {/* Tool Selection */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Choose a Tool</h2>
        <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
          {tools.map((t) => (
            <button
              key={t.id}
              onClick={() => {
                setTool(t.id)
                setResult("")
                setInput("")
              }}
              className={`p-4 rounded-lg border transition-all hover:scale-105 ${
                tool === t.id 
                  ? 'border-purple-500 bg-purple-500/10' 
                  : 'border-white/10 bg-white/5 hover:bg-white/10'
              }`}
            >
              <div className={`text-2xl mb-2 p-2 rounded-lg bg-gradient-to-r ${t.color}`}>
                {t.icon}
              </div>
              <div className="text-sm font-medium text-white">{t.name}</div>
              <div className="text-xs text-white/60 mt-1">{t.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Interface */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        {/* Input Section */}
        <div className="space-y-4">
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <span className={`p-2 rounded-lg bg-gradient-to-r ${currentTool?.color}`}>
                {currentTool?.icon}
              </span>
              {currentTool?.name}
            </h3>
            
            {tool === 'chat' ? (
              <div className="space-y-4">
                <div className="h-96 overflow-y-auto border border-white/10 rounded-lg p-4 bg-white/5">
                  {chatHistory.length === 0 ? (
                    <div className="text-center text-white/60 py-8">
                      <div className="text-4xl mb-2">💬</div>
                      <p>Start a conversation with AI</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {chatHistory.map((msg, i) => (
                        <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[80%] p-3 rounded-lg ${
                            msg.role === 'user' 
                              ? 'bg-purple-600 text-white' 
                              : 'bg-white/10 text-white'
                          }`}>
                            <div className="text-sm font-medium mb-1">
                              {msg.role === 'user' ? 'You' : 'AI Assistant'}
                            </div>
                            <div className="whitespace-pre-wrap">{msg.content}</div>
                            <div className="text-xs opacity-60 mt-1">
                              {msg.timestamp.toLocaleTimeString()}
                            </div>
                          </div>
                        </div>
                      ))}
                      <div ref={chatEndRef} />
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <input
                    className="flex-1 px-4 py-2 rounded-lg border border-white/10 bg-white/5 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder={currentTool?.placeholder}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && runTool()}
                  />
                  <button 
                    onClick={runTool} 
                    disabled={loading || !input.trim()}
                    className="button bg-purple-600 hover:bg-purple-700 disabled:opacity-50"
                  >
                    {loading ? '⏳' : '➤'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <textarea
                  className="w-full h-48 px-4 py-3 rounded-lg border border-white/10 bg-white/5 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                  placeholder={currentTool?.placeholder}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                />
                <button 
                  onClick={runTool} 
                  disabled={loading || !input.trim()}
                  className="w-full button bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 disabled:opacity-50"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Processing...
                    </span>
                  ) : (
                    `Run ${currentTool?.name}`
                  )}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Results Section */}
        <div className="space-y-4">
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Results</h3>
              {result && (
                <button
                  onClick={saveResult}
                  className="text-sm text-purple-400 hover:text-purple-300"
                >
                  💾 Save
                </button>
              )}
            </div>
            
            {result ? (
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                  <pre className="whitespace-pre-wrap text-white text-sm">{result}</pre>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => navigator.clipboard.writeText(result)}
                    className="button bg-white/10 hover:bg-white/20"
                  >
                    📋 Copy
                  </button>
                  <button
                    onClick={() => setResult("")}
                    className="button bg-white/10 hover:bg-white/20"
                  >
                    🗑️ Clear
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center text-white/60 py-8">
                <div className="text-4xl mb-2">✨</div>
                <p>Results will appear here</p>
              </div>
            )}
          </div>

          {/* Saved Results */}
          {savedResults.length > 0 && (
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Saved Results</h3>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {savedResults.map((saved, i) => (
                  <div key={i} className="p-3 rounded-lg bg-white/5 border border-white/10">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-white">
                        {tools.find(t => t.id === saved.tool)?.name}
                      </span>
                      <span className="text-xs text-white/60">
                        {saved.timestamp.toLocaleString()}
                      </span>
                    </div>
                    <div className="text-sm text-white/80 line-clamp-2">{saved.input}</div>
                    <div className="text-xs text-white/60 mt-1 line-clamp-1">{saved.result}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}


