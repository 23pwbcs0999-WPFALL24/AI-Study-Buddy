import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom'

export default function DashboardLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const linkBase = "flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all hover:bg-white/10 hover:text-white text-white/70"

  const isActive = (path: string) => location.pathname.includes(path)

  const navItems = [
    { path: '/dashboard', label: 'Overview', icon: '📊' },
    { path: '/dashboard/notes', label: 'Notes', icon: '📝' },
    { path: '/dashboard/ai-tools', label: 'AI Tools', icon: '🤖' },
    { path: '/dashboard/study-room', label: 'Study Room', icon: '🏠' },
    { path: '/dashboard/profile', label: 'Profile', icon: '👤' },
  ]

  return (
    <div className="min-h-screen grid grid-cols-[280px_1fr] bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900">
      <aside className="border-r border-white/10 p-6 space-y-6 bg-black/20 backdrop-blur-md">
        <div className="space-y-2">
          <h2 className="text-xl font-bold gradient-text">Study Buddy</h2>
          <p className="text-sm text-white/60">Your AI-powered learning companion</p>
        </div>
        
        <nav className="space-y-1">
          {navItems.map((item) => (
            <Link 
              key={item.path}
              className={`${linkBase} ${isActive(item.path) ? 'bg-white/15 text-white border-l-2 border-purple-500' : ''}`} 
              to={item.path}
            >
              <span className="text-lg">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>
        
        <div className="hr" />
        
        <button
          onClick={() => {
            localStorage.removeItem("token")
            document.cookie = "token=; Max-Age=0; path=/"
            navigate('/auth')
          }}
          className="button w-full bg-red-500/10 hover:bg-red-500/20 border-red-500/20 text-red-400"
        >
          🚪 Logout
        </button>
      </aside>
      
      <main className="p-8">
        <div className="animate-in fade-in-50">
          <Outlet />
        </div>
      </main>
    </div>
  )
}


