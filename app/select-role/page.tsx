'use client'
import { useRouter } from 'next/navigation'

const roles = [
  { title: 'Inbound Voice Support', emoji: '📞', desc: 'Call handling, customer communication & voice process' },
  { title: 'Chat & Email Support', emoji: '💬', desc: 'Written communication, chat handling & email support' },
  { title: 'Technical Support L1', emoji: '🖥️', desc: 'Basic troubleshooting & first level tech support' },
  { title: 'Technical Support L2', emoji: '⚙️', desc: 'Advanced technical issues & escalated support' },
  { title: 'Quality Analyst', emoji: '📊', desc: 'Call monitoring, scorecards & quality assurance' },
  { title: 'Back Office & Data Entry', emoji: '📁', desc: 'Data processing, documentation & backend support' },
  { title: 'BPO Interview Prep', emoji: '🎯', desc: 'HR round, common interview questions & answers' },
  { title: 'Soft Skills & HR', emoji: '🤝', desc: 'Professional etiquette, teamwork & workplace skills' },
  { title: 'Aptitude & Logic', emoji: '🧠', desc: 'Numerical ability, logical & verbal reasoning' },
  { title: 'Communication Skills', emoji: '🗣️', desc: 'Pronunciation, accent neutralization & fluency' },
]

export default function SelectRole() {
  const router = useRouter()

  const handleRole = (role: string) => {
    localStorage.setItem('selectedRole', role)
    router.push('/interview')
  }

  return (
    <div className="min-h-screen bg-[#0a0f0a] relative overflow-hidden flex flex-col items-center py-12 px-4">
      {/* Dynamic Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-600/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-green-600/5 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-5xl w-full">
        
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-gradient-to-br from-emerald-400 to-green-600 mb-6 shadow-xl shadow-emerald-500/20 transform -rotate-3 hover:rotate-0 transition-transform duration-500">
            <span className="text-3xl">🌿</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-4">
            Pick Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-green-300">Specialization.</span>
          </h1>
          <p className="text-gray-500 max-w-lg mx-auto text-sm md:text-base leading-relaxed">
            Select the path that matches your ambition. Our AI will curate 20 specialized questions to test your industry readiness.
          </p>
        </div>

        {/* Roles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-5">
          {roles.map((role) => (
            <button
              key={role.title}
              onClick={() => handleRole(role.title)}
              className="group relative bg-white/5 hover:bg-white/[0.08] border border-white/10 hover:border-emerald-500/40 rounded-[2rem] p-6 text-left transition-all duration-300 hover:-translate-y-1 overflow-hidden"
            >
              {/* Card Accent */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full -mr-16 -mt-16 group-hover:bg-emerald-500/10 transition-colors" />

              <div className="flex items-center gap-5 relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-3xl flex-shrink-0 group-hover:scale-110 transition-transform duration-500">
                  {role.emoji}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-white font-bold text-lg group-hover:text-emerald-400 transition-colors">{role.title}</span>
                    <span className="opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all text-emerald-400">→</span>
                  </div>
                  <p className="text-gray-500 text-xs md:text-sm leading-snug">{role.desc}</p>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Informative Footer */}
        <div className="mt-16 flex flex-col items-center gap-4">
          <div className="flex items-center gap-3 px-6 py-2 bg-emerald-500/5 border border-emerald-500/10 rounded-full">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] md:text-xs font-bold text-emerald-500 uppercase tracking-widest">System Ready: Adaptive Interviewing</span>
          </div>
          <div className="flex flex-col items-center gap-2">
             <p className="text-gray-600 text-[10px] md:text-xs uppercase tracking-[0.2em] font-medium">
               Questions Updated Weekly • High-Accuracy AI Analysis
             </p>
             <p className="text-gray-700 text-[10px]">
               Need a custom role? Contact <a href="mailto:info@treelync.com" className="text-emerald-900 hover:text-emerald-700 underline transition-colors">info@treelync.com</a>
             </p>
          </div>
        </div>

      </div>

      <style jsx global>{`
        body {
          background-color: #0a0f0a;
        }
      `}</style>
    </div>
  )
}