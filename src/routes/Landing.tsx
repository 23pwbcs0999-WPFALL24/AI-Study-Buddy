import { Link } from 'react-router-dom'

export default function Landing() {
  const features = [
    {
      icon: '📝',
      title: 'Smart Notes',
      description: 'Organize your study materials with AI-powered summaries, highlights, and automatic categorization.',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: '🤖',
      title: 'AI Tools',
      description: 'Generate flashcards, quizzes, and get instant explanations with our advanced AI assistant.',
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: '🏠',
      title: 'Study Rooms',
      description: 'Collaborate with peers in real-time study sessions with built-in timers and focus tools.',
      color: 'from-green-500 to-emerald-500'
    },
    {
      icon: '📊',
      title: 'Progress Tracking',
      description: 'Monitor your learning journey with detailed analytics and study streak tracking.',
      color: 'from-orange-500 to-red-500'
    },
    {
      icon: '📱',
      title: 'Cross-Platform',
      description: 'Access your study materials anywhere, anytime with our responsive web application.',
      color: 'from-indigo-500 to-purple-500'
    },
    {
      icon: '🔒',
      title: 'Secure & Private',
      description: 'Your data is protected with enterprise-grade security and privacy controls.',
      color: 'from-teal-500 to-cyan-500'
    }
  ]

  const testimonials = [
    {
      name: 'Sarah Chen',
      role: 'Medical Student',
      content: 'Study Buddy has completely transformed how I prepare for exams. The AI tools help me understand complex topics quickly.',
      avatar: '👩‍⚕️'
    },
    {
      name: 'Marcus Rodriguez',
      role: 'Engineering Student',
      content: 'The study rooms are amazing! I can study with my classmates remotely and stay motivated together.',
      avatar: '👨‍💻'
    },
    {
      name: 'Emma Thompson',
      role: 'Law Student',
      content: 'The note organization and search features save me hours. Everything is so intuitive and beautiful.',
      avatar: '👩‍⚖️'
    }
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-6 py-16 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900"></div>
        <div className="absolute top-20 left-20 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl"></div>
        
        <div className="relative z-10 w-full max-w-6xl text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/15 bg-white/5 text-sm text-white/80 mb-8 animate-fade-in">
            <span className="inline-block h-2 w-2 rounded-full bg-purple-400 animate-pulse"></span>
            Now with real-time collaboration and AI-powered tools
          </div>

          {/* Main Heading */}
          <h1 className="text-5xl md:text-7xl font-extrabold leading-tight mb-6">
            Study smarter with{' '}
            <span className="gradient-text">AI Study Buddy</span>
          </h1>
          
          <p className="text-xl text-white/70 max-w-3xl mx-auto mb-12 leading-relaxed">
            Transform your learning experience with AI-powered study tools, collaborative study rooms, 
            and intelligent note management. Join thousands of students achieving better results.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link 
              to="/auth" 
              className="px-8 py-4 rounded-lg bg-gradient-to-r from-purple-600 to-cyan-600 text-white font-semibold hover:from-purple-700 hover:to-cyan-700 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-purple-500/25"
            >
              🚀 Get Started Free
            </Link>
            <Link 
              to="/auth" 
              className="px-8 py-4 rounded-lg border border-white/20 bg-white/5 text-white font-semibold hover:bg-white/10 transition-all duration-200"
            >
              📚 View Demo
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-2">10K+</div>
              <div className="text-white/60">Active Students</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-2">50K+</div>
              <div className="text-white/60">Notes Created</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-2">95%</div>
              <div className="text-white/60">Success Rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 bg-gradient-to-b from-slate-900 to-slate-800">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Everything you need to excel
            </h2>
            <p className="text-xl text-white/60 max-w-2xl mx-auto">
              Powerful features designed to make studying more effective, collaborative, and enjoyable.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="card p-8 hover:scale-105 transition-all duration-300 cursor-pointer group"
              >
                <div className={`w-16 h-16 rounded-lg bg-gradient-to-r ${feature.color} flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition-transform`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-white mb-4">{feature.title}</h3>
                <p className="text-white/60 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-6 bg-slate-800">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              How it works
            </h2>
            <p className="text-xl text-white/60">
              Get started in minutes with our simple 3-step process
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-20 h-20 rounded-full bg-gradient-to-r from-purple-600 to-cyan-600 flex items-center justify-center text-2xl font-bold text-white mx-auto mb-6">
                1
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">Sign Up & Create</h3>
              <p className="text-white/60">
                Create your account and start building your personalized study environment
              </p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 rounded-full bg-gradient-to-r from-purple-600 to-cyan-600 flex items-center justify-center text-2xl font-bold text-white mx-auto mb-6">
                2
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">Upload & Organize</h3>
              <p className="text-white/60">
                Upload your notes, documents, or create new content with our smart tools
              </p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 rounded-full bg-gradient-to-r from-purple-600 to-cyan-600 flex items-center justify-center text-2xl font-bold text-white mx-auto mb-6">
                3
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">Study & Collaborate</h3>
              <p className="text-white/60">
                Use AI tools, join study rooms, and track your progress to success
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-6 bg-gradient-to-b from-slate-800 to-slate-900">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Loved by students worldwide
            </h2>
            <p className="text-xl text-white/60">
              See what our users have to say about their experience
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="card p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="text-3xl">{testimonial.avatar}</div>
                  <div>
                    <div className="font-semibold text-white">{testimonial.name}</div>
                    <div className="text-sm text-white/60">{testimonial.role}</div>
                  </div>
                </div>
                <p className="text-white/80 leading-relaxed italic">
                  "{testimonial.content}"
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-gradient-to-r from-purple-600 to-cyan-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to transform your study habits?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join thousands of students who are already achieving better results with AI Study Buddy.
          </p>
          <Link 
            to="/auth" 
            className="inline-block px-8 py-4 rounded-lg bg-white text-purple-600 font-semibold hover:bg-gray-100 transition-all duration-200 transform hover:scale-105 shadow-lg"
          >
            Start Your Free Trial
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 bg-slate-900 border-t border-white/10">
        <div className="max-w-6xl mx-auto text-center">
          <div className="text-2xl font-bold gradient-text mb-4">Study Buddy</div>
          <p className="text-white/60 mb-8">
            Your AI-powered learning companion
          </p>
          <div className="flex items-center justify-center gap-6 text-white/60">
            <span>© 2024 Study Buddy. All rights reserved.</span>
            <span>•</span>
            <span>Privacy Policy</span>
            <span>•</span>
            <span>Terms of Service</span>
          </div>
        </div>
      </footer>
    </div>
  )
}


