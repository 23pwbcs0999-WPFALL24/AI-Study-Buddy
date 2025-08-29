import { useEffect, useState } from 'react'

interface UserProfile {
  _id: string
  name: string
  email: string
  createdAt: string
  stats: {
    totalNotes: number
    studyStreak: number
    totalStudyTime: number
    lastActive: string
  }
  badges: Array<{
    name: string
    description: string
    icon: string
    earnedAt: string
  }>
  studyHistory: Array<{
    activity: string
    details: string
    timestamp: string
  }>
}

export default function Profile() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'achievements' | 'history' | 'settings'>('overview')
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({ name: '', email: '' })
  const [lastUpdate, setLastUpdate] = useState(new Date())
  
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null

  useEffect(() => {
    loadProfile()
    
    // Set up real-time updates every 30 seconds
    const interval = setInterval(() => {
      loadProfile()
      setLastUpdate(new Date())
    }, 30000)

    return () => clearInterval(interval)
  }, [])

  const loadProfile = async () => {
    if (!token) return
    setLoading(true)
    try {
      const res = await fetch('/api/auth/profile', {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      if (res.ok) {
        setProfile(data)
        setEditForm({ 
          name: data.name || '', 
          email: data.email || '' 
        })
      }
    } catch (error) {
      console.error('Error loading profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateProfile = async () => {
    if (!token || !profile) return
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(editForm)
      })
      if (res.ok) {
        setProfile({ ...profile, ...editForm })
        setIsEditing(false)
        // Refresh profile data after update
        loadProfile()
      }
    } catch (error) {
      console.error('Error updating profile:', error)
    }
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'achievements', label: 'Achievements', icon: '🏆' },
    { id: 'history', label: 'Study History', icon: '📈' },
    { id: 'settings', label: 'Settings', icon: '⚙️' }
  ]

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-white">Profile</h1>
        </div>
        <div className="grid gap-6 grid-cols-1 md:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="card p-6 animate-pulse">
              <div className="h-4 bg-white/10 rounded mb-2"></div>
              <div className="h-8 bg-white/10 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-white">Profile</h1>
        <div className="card p-8 text-center text-white/60">
          <div className="text-4xl mb-2">❌</div>
          <p>Failed to load profile</p>
        </div>
      </div>
    )
  }

  // Safe fallbacks for profile data
  const safeName = profile.name || 'User'
  const safeEmail = profile.email || 'No email'
  const safeCreatedAt = profile.createdAt || new Date().toISOString()
  const safeStats = profile.stats || {
    totalNotes: 0,
    studyStreak: 0,
    totalStudyTime: 0,
    lastActive: new Date().toISOString()
  }
  const safeBadges = profile.badges || []
  const safeStudyHistory = profile.studyHistory || []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Profile</h1>
          <p className="text-white/60 mt-1">Manage your account and view your progress</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-sm text-white/60">Last updated</div>
            <div className="text-white">{lastUpdate.toLocaleTimeString()}</div>
            <button
              onClick={loadProfile}
              className="text-xs text-purple-400 hover:text-purple-300 mt-1"
            >
              🔄 Refresh
            </button>
          </div>
          {activeTab === 'settings' && (
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="button bg-purple-600 hover:bg-purple-700"
            >
              {isEditing ? 'Cancel' : 'Edit Profile'}
            </button>
          )}
        </div>
      </div>

      {/* Profile Card */}
      <div className="card p-8">
        <div className="flex items-center gap-6 mb-8">
          <div className="w-20 h-20 rounded-full bg-gradient-to-r from-purple-600 to-cyan-600 flex items-center justify-center text-3xl font-bold text-white">
            {safeName.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-white">{safeName}</h2>
            <p className="text-white/60">{safeEmail}</p>
            <p className="text-sm text-white/40">
              Member since {new Date(safeCreatedAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-6 grid-cols-1 md:grid-cols-4 mb-8">
          <div className="text-center p-4 rounded-lg bg-white/5">
            <div className="text-2xl font-bold text-white">{safeStats.totalNotes}</div>
            <div className="text-sm text-white/60">Total Notes</div>
          </div>
          <div className="text-center p-4 rounded-lg bg-white/5">
            <div className="text-2xl font-bold text-white">{safeStats.studyStreak}</div>
            <div className="text-sm text-white/60">Day Streak</div>
          </div>
          <div className="text-center p-4 rounded-lg bg-white/5">
            <div className="text-2xl font-bold text-white">{Math.round(safeStats.totalStudyTime / 60)}h</div>
            <div className="text-sm text-white/60">Study Time</div>
          </div>
          <div className="text-center p-4 rounded-lg bg-white/5">
            <div className="text-2xl font-bold text-white">{safeBadges.length}</div>
            <div className="text-sm text-white/60">Badges</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-white/10">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-2 rounded-t-lg transition-colors ${
              activeTab === tab.id
                ? 'bg-white/10 text-white border-b-2 border-purple-500'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <span>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {activeTab === 'overview' && (
          <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
            {/* Recent Activity */}
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
              {safeStudyHistory.length > 0 ? (
                <div className="space-y-3">
                  {safeStudyHistory.slice(0, 5).map((activity, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-white/5">
                      <div className="text-2xl">📝</div>
                      <div className="flex-1">
                        <div className="font-medium text-white">{activity.activity}</div>
                        <div className="text-sm text-white/60">{activity.details}</div>
                        <div className="text-xs text-white/40 mt-1">
                          {new Date(activity.timestamp).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-white/60">
                  <div className="text-4xl mb-2">📝</div>
                  <p>No recent activity</p>
                  <p className="text-sm">Start studying to see your activity here!</p>
                </div>
              )}
            </div>

            {/* Study Goals */}
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Study Goals</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-white">Daily Study Time</span>
                    <span className="text-white/60">2h / 3h</span>
                  </div>
                  <div className="w-full h-2 bg-white/10 rounded-full">
                    <div className="h-2 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-full" style={{ width: '67%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-white">Weekly Notes</span>
                    <span className="text-white/60">8 / 10</span>
                  </div>
                  <div className="w-full h-2 bg-white/10 rounded-full">
                    <div className="h-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full" style={{ width: '80%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-white">Study Streak</span>
                    <span className="text-white/60">{safeStats.studyStreak} days</span>
                  </div>
                  <div className="w-full h-2 bg-white/10 rounded-full">
                    <div className="h-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-full" style={{ width: `${Math.min(100, safeStats.studyStreak * 10)}%` }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'achievements' && (
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-white mb-6">Achievements & Badges</h3>
            {safeBadges.length > 0 ? (
              <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {safeBadges.map((badge, i) => (
                  <div key={i} className="p-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="text-2xl">{badge.icon}</div>
                      <div>
                        <div className="font-semibold text-white">{badge.name}</div>
                        <div className="text-sm text-white/60">{badge.description}</div>
                      </div>
                    </div>
                    <div className="text-xs text-white/40">
                      Earned {new Date(badge.earnedAt).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-white/60">
                <div className="text-4xl mb-2">🏆</div>
                <p>No badges yet</p>
                <p className="text-sm">Start studying to earn achievements!</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'history' && (
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-white mb-6">Study History</h3>
            {safeStudyHistory.length > 0 ? (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {safeStudyHistory.map((activity, i) => (
                  <div key={i} className="flex items-start gap-3 p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                    <div className="text-2xl">📚</div>
                    <div className="flex-1">
                      <div className="font-medium text-white">{activity.activity}</div>
                      <div className="text-sm text-white/60">{activity.details}</div>
                      <div className="text-xs text-white/40 mt-1">
                        {new Date(activity.timestamp).toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-white/60">
                <div className="text-4xl mb-2">📚</div>
                <p>No study history yet</p>
                <p className="text-sm">Start studying to build your history!</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-white mb-6">Account Settings</h3>
            <div className="space-y-4 max-w-md">
              <div>
                <label className="text-sm font-medium text-white/80 mb-2 block">Full Name</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  disabled={!isEditing}
                  className="w-full px-4 py-2 rounded-lg border border-white/10 bg-white/5 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-white/80 mb-2 block">Email Address</label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  disabled={!isEditing}
                  className="w-full px-4 py-2 rounded-lg border border-white/10 bg-white/5 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
                />
              </div>
              {isEditing && (
                <div className="flex gap-2 pt-4">
                  <button
                    onClick={updateProfile}
                    className="button bg-green-600 hover:bg-green-700"
                  >
                    Save Changes
                  </button>
                  <button
                    onClick={() => {
                      setIsEditing(false)
                      setEditForm({ name: safeName, email: safeEmail })
                    }}
                    className="button bg-white/10 hover:bg-white/20"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}


