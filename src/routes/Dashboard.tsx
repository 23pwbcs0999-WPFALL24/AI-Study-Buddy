import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

interface UserStats {
  totalNotes: number
  studyStreak: number
  totalStudyTime: number
  lastActive: string
}

export default function Dashboard() {
  const [stats, setStats] = useState<UserStats>({
    totalNotes: 0,
    studyStreak: 0,
    totalStudyTime: 0,
    lastActive: new Date().toISOString()
  })
  const [recentNotes, setRecentNotes] = useState([])
  const [loading, setLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState(new Date())

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null

  useEffect(() => {
    fetchDashboardData()
    
    // Set up real-time updates every 30 seconds
    const interval = setInterval(() => {
      fetchDashboardData()
      setLastUpdate(new Date())
    }, 30000)

    return () => clearInterval(interval)
  }, [])

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return

      // Fetch user stats and recent notes
      const [statsRes, notesRes] = await Promise.all([
        fetch('/api/progress/stats', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch('/api/notes?limit=5', {
          headers: { Authorization: `Bearer ${token}` }
        })
      ])

      if (statsRes.ok) {
        const statsData = await statsRes.json()
        setStats(statsData.stats || stats)
      }

      if (notesRes.ok) {
        const notesData = await notesRes.json()
        setRecentNotes(notesData.notes || [])
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const quickActions = [
    {
      title: 'Create Note',
      description: 'Add a new study note',
      icon: '📝',
      link: '/dashboard/notes',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      title: 'AI Summarize',
      description: 'Summarize text with AI',
      icon: '🤖',
      link: '/dashboard/ai-tools',
      color: 'from-purple-500 to-pink-500'
    },
    {
      title: 'Join Study Room',
      description: 'Study with others',
      icon: '🏠',
      link: '/dashboard/study-room',
      color: 'from-green-500 to-emerald-500'
    },
    {
      title: 'View Profile',
      description: 'Check your progress',
      icon: '👤',
      link: '/dashboard/profile',
      color: 'from-orange-500 to-red-500'
    }
  ]

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          <div className="text-white/60">Welcome back!</div>
        </div>
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="card p-6 animate-pulse">
              <div className="h-4 bg-white/10 rounded mb-2"></div>
              <div className="h-8 bg-white/10 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          <p className="text-white/60 mt-1">Welcome back! Here's your study overview</p>
        </div>
        <div className="text-right">
          <div className="text-sm text-white/60">Last updated</div>
          <div className="text-white">{lastUpdate.toLocaleTimeString()}</div>
          <button
            onClick={fetchDashboardData}
            className="text-xs text-purple-400 hover:text-purple-300 mt-1"
          >
            🔄 Refresh
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-white/60">Total Notes</p>
              <p className="text-2xl font-bold text-white">{stats.totalNotes}</p>
            </div>
            <div className="text-3xl">📝</div>
          </div>
        </div>
        
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-white/60">Study Streak</p>
              <p className="text-2xl font-bold text-white">{stats.studyStreak} days</p>
            </div>
            <div className="text-3xl">🔥</div>
          </div>
        </div>
        
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-white/60">Study Time</p>
              <p className="text-2xl font-bold text-white">{Math.round(stats.totalStudyTime / 60)}h</p>
            </div>
            <div className="text-3xl">⏱️</div>
          </div>
        </div>
        
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-white/60">Progress</p>
              <p className="text-2xl font-bold text-white">85%</p>
            </div>
            <div className="text-3xl">📈</div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold text-white mb-4">Quick Actions</h2>
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
          {quickActions.map((action) => (
            <Link
              key={action.title}
              to={action.link}
              className="card p-6 hover:scale-105 transition-all duration-200 cursor-pointer group"
            >
              <div className="flex items-center gap-4">
                <div className={`text-3xl p-3 rounded-lg bg-gradient-to-r ${action.color} group-hover:scale-110 transition-transform`}>
                  {action.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-white group-hover:text-purple-400 transition-colors">
                    {action.title}
                  </h3>
                  <p className="text-sm text-white/60">{action.description}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Recent Notes</h3>
          {recentNotes.length > 0 ? (
            <div className="space-y-3">
              {recentNotes.slice(0, 5).map((note: any) => (
                <div key={note._id} className="flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                  <div className="text-2xl">📄</div>
                  <div className="flex-1">
                    <div className="font-medium text-white">{note.title}</div>
                    <div className="text-sm text-white/60">
                      {new Date(note.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-white/60">
              <div className="text-4xl mb-2">📝</div>
              <p>No notes yet</p>
              <Link to="/dashboard/notes" className="text-purple-400 hover:underline">
                Create your first note
              </Link>
            </div>
          )}
        </div>

        <div className="card p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Study Tips</h3>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="text-2xl">💡</div>
              <div>
                <div className="font-medium text-white">Use the Pomodoro Technique</div>
                <div className="text-sm text-white/60">Study for 25 minutes, then take a 5-minute break</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="text-2xl">🎯</div>
              <div>
                <div className="font-medium text-white">Set Clear Goals</div>
                <div className="text-sm text-white/60">Break down large topics into smaller, manageable chunks</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="text-2xl">🔄</div>
              <div>
                <div className="font-medium text-white">Review Regularly</div>
                <div className="text-sm text-white/60">Spaced repetition helps retain information better</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


