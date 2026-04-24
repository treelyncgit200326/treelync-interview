'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function Results() {
  const [scores, setScores] = useState<any[]>([])
  const [candidate, setCandidate] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    const s = localStorage.getItem('scores')
    const c = localStorage.getItem('candidate')
    if (s) setScores(JSON.parse(s))
    if (c) setCandidate(JSON.parse(c))
  }, [])

  const avg = (key: string) => {
    if (!scores.length) return 0
    return Math.round(scores.reduce((a, b) => a + (b[key] || 0), 0) / scores.length)
  }

  const overallScore = Math.round((avg('accuracy') + avg('fluency')) / 2)
  const passed = overallScore >= 75

  return (
    <div className="min-h-screen bg-[#0a0f0a] text-white p-4 md:p-10 relative overflow-hidden">
      {/* Dynamic Background Glows */}
      <div className="absolute inset-0 pointer-events-none">
        <div className={`absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full blur-[120px] transition-colors duration-1000 ${passed ? 'bg-emerald-600/10' : 'bg-red-600/10'}`} />
        <div className={`absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full blur-[120px] transition-colors duration-1000 ${passed ? 'bg-green-600/10' : 'bg-orange-600/10'}`} />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto">
        
        {/* Header Section */}
        <div className="text-center mb-10">
          <div className={`inline-flex items-center justify-center w-16 h-16 rounded-3xl mb-6 shadow-2xl transition-all duration-500 ${passed ? 'bg-emerald-500 shadow-emerald-500/20' : 'bg-red-500 shadow-red-500/20'}`}>
            <span className="text-3xl">{passed ? '🏆' : '📉'}</span>
          </div>
          <h1 className="text-4xl font-black tracking-tight mb-2">Evaluation Complete</h1>
          <p className="text-gray-500 font-medium tracking-wide italic">Candidate: {candidate?.name || 'User'}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left: Overall Score Gauge */}
          <div className="lg:col-span-5 bg-white/5 border border-white/10 backdrop-blur-2xl rounded-[2.5rem] p-8 text-center flex flex-col items-center justify-center relative overflow-hidden">
             {/* Subtle score background */}
             <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] select-none">
                <span className="text-[15rem] font-black">{overallScore}</span>
             </div>

             <div className="relative z-10">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 mb-2">Overall Proficiency</p>
                <div className={`text-9xl font-black mb-4 tracking-tighter ${passed ? 'text-emerald-400' : 'text-red-400'}`}>
                  {overallScore}<span className="text-3xl opacity-50">%</span>
                </div>
                <div className={`inline-block px-6 py-2 rounded-full font-black text-xs uppercase tracking-widest border-2 ${passed ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400' : 'bg-red-500/10 border-red-500/40 text-red-400'}`}>
                   {passed ? 'Qualification Met' : 'Needs Improvement'}
                </div>
                <p className="mt-6 text-sm text-gray-500 leading-relaxed max-w-[200px] mx-auto">
                  {passed 
                    ? 'Exceptional performance. Your communication and technical skills meet our benchmark.' 
                    : 'Target benchmark is 75%. We recommend focused training on fluency and tone.'}
                </p>
             </div>
          </div>

          {/* Right: Detailed Metrics */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Metric Cards */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/5 border border-white/10 p-6 rounded-3xl backdrop-blur-md">
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Avg Accuracy</p>
                <div className="text-3xl font-black text-white">{avg('accuracy')}%</div>
                <div className="w-full bg-white/5 h-1.5 rounded-full mt-3 overflow-hidden">
                   <div className="bg-emerald-400 h-full rounded-full" style={{ width: `${avg('accuracy')}%` }} />
                </div>
              </div>
              <div className="bg-white/5 border border-white/10 p-6 rounded-3xl backdrop-blur-md">
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Avg Fluency</p>
                <div className="text-3xl font-black text-white">{avg('fluency')}%</div>
                <div className="w-full bg-white/5 h-1.5 rounded-full mt-3 overflow-hidden">
                   <div className="bg-green-400 h-full rounded-full" style={{ width: `${avg('fluency')}%` }} />
                </div>
              </div>
            </div>

            {/* AI Insight / Feedback List */}
            <div className="bg-white/5 border border-white/10 rounded-[2rem] p-6 backdrop-blur-md">
              <h3 className="text-xs font-black text-emerald-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(52,211,153,0.5)]" />
                Detailed AI Insights
              </h3>
              <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {scores.map((s, i) => (
                  <div key={i} className="group bg-white/5 border border-white/5 hover:border-emerald-500/20 rounded-2xl p-4 transition-all">
                    <div className="flex justify-between items-center mb-2">
                       <span className="text-[10px] font-black text-gray-500 uppercase">Response 0{i+1}</span>
                       <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${s.tone === 'Professional' ? 'text-emerald-400 bg-emerald-500/10' : 'text-yellow-400 bg-yellow-500/10'}`}>
                         {s.tone}
                       </span>
                    </div>
                    <p className="text-sm text-gray-300 leading-relaxed italic">"{s.feedback}"</p>
                    <div className="flex gap-4 mt-3 text-[10px] font-bold text-gray-500 uppercase tracking-tighter">
                      <span>Acc: <span className="text-white">{s.accuracy}</span></span>
                      <span>Flu: <span className="text-white">{s.fluency}</span></span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA Actions */}
            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              {passed ? (
                <button className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-[#0a0f0a] font-black py-5 rounded-2xl transition-all shadow-xl shadow-emerald-500/10 active:scale-95">
                  🚀 PLACEMENT PORTAL
                </button>
              ) : (
                <button className="flex-1 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white font-black py-5 rounded-2xl transition-all shadow-xl shadow-red-500/10 active:scale-95 text-center px-4">
                  📚 JOIN 21-DAY BPO MASTERY
                </button>
              )}
              <button
                onClick={() => router.push('/')}
                className="flex-none bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold px-8 py-5 rounded-2xl transition-all"
              >
                🔄 RE-TAKE
              </button>
            </div>
          </div>
        </div>

        {/* Support Footer */}
        <div className="mt-12 text-center">
           <p className="text-[10px] text-gray-600 font-bold uppercase tracking-[0.4em]">Report Generated by Treelync AI • Secure Analysis</p>
        </div>

      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 3px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(16, 185, 129, 0.2); border-radius: 10px; }
      `}</style>
    </div>
  )
}