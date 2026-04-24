'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../lib/supabase'

export default function Home() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async () => {
    if (!email || !password) return alert('Please fill in both Email and Password!')
    setLoading(true)
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { alert('Invalid email or password!'); setLoading(false); return }
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', data.user.id).single()
    if (profile?.role === 'admin') {
      router.push('/admin')
    } else {
      localStorage.setItem('candidate', JSON.stringify(data.user))
      router.push('/select-role')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-[#0a0f0a] flex relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute top-[-300px] left-[-200px] w-[700px] h-[700px] bg-emerald-600/10 rounded-full blur-[140px]" />
        <div className="absolute bottom-[-300px] right-[-200px] w-[700px] h-[700px] bg-green-600/8 rounded-full blur-[140px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-teal-600/5 rounded-full blur-[100px]" />
      </div>

      {/* Left Panel */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 p-12 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-green-600 flex items-center justify-center text-lg">🌿</div>
          <span className="text-white font-bold text-xl tracking-tight">Treelync</span>
        </div>

        <div>
          <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-4 py-1.5 rounded-full mb-6">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
            <span className="text-emerald-400 text-xs font-medium">AI Interview Platform — Live</span>
          </div>
          <h1 className="text-5xl font-bold text-white leading-tight mb-4">
            Root Deep.<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-green-300">Branch Wide.</span><br />
            Grow Bold.
          </h1>
          <p className="text-gray-400 text-lg leading-relaxed max-w-md">
            AI-powered mock interviews designed to prepare candidates for BPO and back-office roles. Get scored, get feedback, get placed.
          </p>

          <div className="grid grid-cols-3 gap-4 mt-10">
            {[
              { value: '1200+', label: 'Questions' },
              { value: '10', label: 'BPO Roles' },
              { value: '50+', label: 'Placed' },
            ].map((s) => (
              <div key={s.label} className="bg-white/5 border border-white/8 rounded-2xl p-4">
                <div className="text-2xl font-bold text-emerald-400">{s.value}</div>
                <div className="text-gray-500 text-xs mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        <p className="text-gray-600 text-xs">© 2025 Treelync · India 🇮🇳 · Grow. Connect. Thrive.</p>
      </div>

      {/* Right Panel - Login */}
      <div className="flex-1 flex items-center justify-center p-6 relative z-10">
        <div className="w-full max-w-md">

          {/* Mobile Logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-400 to-green-600 flex items-center justify-center">🌿</div>
            <span className="text-white font-bold text-lg">Treelync</span>
          </div>

          <div className="bg-white/4 border border-white/10 backdrop-blur-2xl rounded-3xl p-8 shadow-2xl">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-white mb-1">Welcome Back</h2>
              <p className="text-gray-400 text-sm">Sign in to access your interview portal</p>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <label className="text-xs text-gray-400 font-medium mb-2 block uppercase tracking-widest">Email Address</label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-gray-600 outline-none focus:border-emerald-500/50 focus:bg-white/8 transition-all text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 font-medium mb-2 block uppercase tracking-widest">Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-gray-600 outline-none focus:border-emerald-500/50 transition-all text-sm"
                />
              </div>
            </div>

            <button
              onClick={handleLogin}
              disabled={loading}
              className="w-full bg-gradient-to-r from-emerald-600 to-green-500 hover:from-emerald-500 hover:to-green-400 text-white font-semibold py-3.5 rounded-xl transition-all duration-300 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                  </svg>
                  Signing in...
                </span>
              ) : 'Sign In →'}
            </button>

            <p className="text-center text-gray-600 text-xs mt-5">
              Contact your administrator for access credentials
            </p>
          </div>

          <div className="flex items-center justify-center gap-6 mt-6">
            {['AI Scored', 'Real-time Feedback', 'Instant Results'].map((f) => (
              <div key={f} className="flex items-center gap-1.5 text-gray-500 text-xs">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                {f}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}