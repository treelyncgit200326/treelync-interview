'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'

export default function Admin() {
  const [candidates, setCandidates] = useState<any[]>([])
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [creating, setCreating] = useState(false)
  const router = useRouter()

  useEffect(() => {
    checkAdmin()
    fetchCandidates()
  }, [])

  const checkAdmin = async () => {
    const { data } = await supabase.auth.getUser()
    if (!data.user) { router.push('/'); return }
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', data.user.id).single()
    if (profile?.role !== 'admin') router.push('/')
  }

  const fetchCandidates = async () => {
    const { data } = await supabase.from('profiles').select('*').eq('role', 'candidate')
    if (data) setCandidates(data)
  }

  const createCandidate = async () => {
    if (!email || !password || !name) return alert('Please fill all fields!')
    setCreating(true)

    const res = await fetch('/api/create-candidate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name })
    })

    const result = await res.json()
    if (result.error) {
      alert('Error: ' + result.error)
    } else {
      alert(`✅ Candidate created successfully!`)
      setEmail('')
      setPassword('')
      setName('')
      fetchCandidates()
    }
    setCreating(false)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const generatePassword = () => {
    const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'
    let pass = ''
    for (let i = 0; i < 8; i++) pass += chars[Math.floor(Math.random() * chars.length)]
    setPassword(pass)
  }

  return (
    <div className="min-h-screen bg-[#0a0f0a] text-white p-6 relative overflow-hidden">
      {/* Background Glows matching Login */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-200px] left-[-100px] w-[600px] h-[600px] bg-emerald-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-200px] right-[-100px] w-[600px] h-[600px] bg-green-600/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-green-600 flex items-center justify-center text-xl shadow-lg shadow-emerald-500/20">
              🌿
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Treelync Admin</h1>
              <p className="text-emerald-500/60 text-xs font-medium uppercase tracking-widest">Management Dashboard</p>
            </div>
          </div>
          <button 
            onClick={handleLogout} 
            className="self-start md:self-center bg-white/5 border border-white/10 hover:bg-red-500/10 hover:border-red-500/20 px-5 py-2.5 rounded-xl text-sm transition-all duration-300 flex items-center gap-2"
          >
            Logout <span className="opacity-60">→</span>
          </button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-10">
          {[
            { label: 'Total Candidates', value: candidates.length, icon: '👥' },
            { label: 'Active Sessions', value: '12', icon: '🎤' },
            { label: 'Avg. Score', value: '84%', icon: '📈' },
          ].map((stat) => (
            <div key={stat.label} className="bg-white/5 border border-white/10 backdrop-blur-md rounded-2xl p-6 hover:border-emerald-500/30 transition-colors">
              <div className="text-2xl mb-3">{stat.icon}</div>
              <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
              <div className="text-gray-500 text-xs uppercase tracking-wider">{stat.label}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          
          {/* Create Candidate Form - Left Panel (2/5) */}
          <div className="lg:col-span-2 bg-white/5 border border-white/10 backdrop-blur-2xl rounded-3xl p-8 shadow-xl">
            <div className="mb-6">
                <h2 className="text-lg font-semibold text-emerald-400">Onboard New Talent</h2>
                <p className="text-gray-500 text-xs">Register a new candidate for interviews</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-[10px] text-gray-400 font-bold mb-2 block uppercase tracking-widest">Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Rahul Sharma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 outline-none focus:border-emerald-500/50 transition-all text-sm"
                />
              </div>

              <div>
                <label className="text-[10px] text-gray-400 font-bold mb-2 block uppercase tracking-widest">Email Address</label>
                <input
                  type="email"
                  placeholder="rahul@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 outline-none focus:border-emerald-500/50 transition-all text-sm"
                />
              </div>

              <div>
                <label className="text-[10px] text-gray-400 font-bold mb-2 block uppercase tracking-widest">Access Password</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 outline-none focus:border-emerald-500/50 transition-all text-sm font-mono"
                  />
                  <button 
                    onClick={generatePassword} 
                    className="bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 px-4 rounded-xl text-emerald-400 text-xs font-bold transition-all"
                    title="Generate Password"
                  >
                    🪄
                  </button>
                </div>
              </div>

              <button
                onClick={createCandidate}
                disabled={creating}
                className="w-full bg-gradient-to-r from-emerald-600 to-green-500 hover:from-emerald-500 hover:to-green-400 text-white font-bold py-4 rounded-xl mt-4 transition-all duration-300 shadow-lg shadow-emerald-500/10 disabled:opacity-50"
              >
                {creating ? 'Syncing Data...' : 'Confirm Registration'}
              </button>
            </div>
          </div>

          {/* Candidates List - Right Panel (3/5) */}
          <div className="lg:col-span-3 bg-white/5 border border-white/10 backdrop-blur-2xl rounded-3xl p-8 flex flex-col h-[520px]">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-lg font-semibold text-white">Candidate Registry</h2>
                    <p className="text-gray-500 text-xs">Manage active accounts</p>
                </div>
                <div className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  {candidates.length} Total
                </div>
            </div>

            <div className="space-y-3 overflow-y-auto pr-2 custom-scrollbar">
              {candidates.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full py-20 opacity-30">
                  <span className="text-4xl mb-4">🍃</span>
                  <p className="text-sm">No candidates found in the system</p>
                </div>
              ) : (
                candidates.map((c, i) => (
                  <div key={i} className="group flex items-center justify-between bg-white/5 border border-white/5 hover:border-emerald-500/20 hover:bg-white/8 rounded-2xl px-5 py-4 transition-all duration-300">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 font-bold border border-emerald-500/20">
                        {c.name?.charAt(0) || 'C'}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-white group-hover:text-emerald-400 transition-colors">{c.name || 'Anonymous'}</div>
                        <div className="text-xs text-gray-500">{c.email}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.5)]"></div>
                        <span className="text-[10px] font-bold text-gray-500 uppercase">Active</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(16, 185, 129, 0.2); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(16, 185, 129, 0.4); }
      `}</style>
    </div>
  )
}