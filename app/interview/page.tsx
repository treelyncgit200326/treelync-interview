'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'

export default function Interview() {
  const [questions, setQuestions] = useState<any[]>([])
  const [current, setCurrent] = useState(0)
  const [recording, setRecording] = useState(false)
  const [loading, setLoading] = useState(false)
  const [scores, setScores] = useState<any[]>([])
  const [timeLeft, setTimeLeft] = useState(1200)
  const [status, setStatus] = useState('idle')
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>(0)
  const streamRef = useRef<MediaStream | null>(null)
  const router = useRouter()

  useEffect(() => {
    fetchQuestions()
    startCamera()
    return () => {
      streamRef.current?.getTracks().forEach(track => track.stop())
      cancelAnimationFrame(animationRef.current)
    }
  }, [])

  useEffect(() => {
    if (timeLeft <= 0) { router.push('/results'); return }
    const timer = setInterval(() => setTimeLeft(t => t - 1), 1000)
    return () => clearInterval(timer)
  }, [timeLeft])

  const fetchQuestions = async () => {
    const role = localStorage.getItem('selectedRole')
    const { data } = await supabase.from('questions').select('*').eq('category', role).limit(20)
    if (data) setQuestions(data)
  }

  const getSupportedMimeType = () => {
    const types = ['audio/webm;codecs=opus', 'audio/webm', 'audio/ogg;codecs=opus', 'audio/mp4', 'audio/aac'];
    for (const type of types) {
      if (MediaRecorder.isTypeSupported(type)) return type;
    }
    return '';
  }

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 },
        audio: true
      })
      streamRef.current = stream
      if (videoRef.current) videoRef.current.srcObject = stream

      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)()
      const source = audioCtx.createMediaStreamSource(stream)
      const analyser = audioCtx.createAnalyser()
      analyser.fftSize = 128
      source.connect(analyser)
      const dataArray = new Uint8Array(analyser.frequencyBinCount)

      const draw = () => {
        animationRef.current = requestAnimationFrame(draw)
        const canvas = canvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext('2d')
        if (!ctx) return
        analyser.getByteFrequencyData(dataArray)
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        
        const barWidth = (canvas.width / dataArray.length) * 2.5
        let x = 0
        for (let i = 0; i < dataArray.length; i++) {
          const barHeight = (dataArray[i] / 255) * canvas.height
          // Using Emerald theme for the waveform
          ctx.fillStyle = `rgba(52, 211, 153, ${dataArray[i] / 255 + 0.2})`
          ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight)
          x += barWidth + 2
        }
      }
      draw()
    } catch (err) {
      alert('Please allow Camera & Microphone access!')
    }
  }

  const startRecording = () => {
    const stream = streamRef.current;
    if (!stream || !stream.active) return;
    const audioOnlyStream = new MediaStream(stream.getAudioTracks());
    chunksRef.current = [];
    try {
      const mimeType = getSupportedMimeType();
      const recorder = new MediaRecorder(audioOnlyStream, { mimeType });
      recorder.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      mediaRecorderRef.current = recorder;
      if (recorder.state === 'inactive') {
        recorder.start(1000);
        setRecording(true);
        setStatus('recording');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const stopAndSubmit = async () => {
    if (!mediaRecorderRef.current) return
    mediaRecorderRef.current.stop()
    setRecording(false)
    setLoading(true)
    setStatus('processing')
    await new Promise(r => setTimeout(r, 500))
    const mimeType = mediaRecorderRef.current.mimeType
    const blob = new Blob(chunksRef.current, { type: mimeType })
    const formData = new FormData()
    formData.append('audio', blob, 'answer.webm')
    formData.append('question', questions[current]?.question_text)
    formData.append('keywords', questions[current]?.ideal_keywords)

    try {
      const res = await fetch('/api/evaluate', { method: 'POST', body: formData })
      const result = await res.json()
      const candidate = JSON.parse(localStorage.getItem('candidate') || '{}')
      
      await supabase.from('results').insert({
        candidate_id: candidate.id,
        question_id: questions[current]?.id,
        transcribed_text: result.transcript,
        accuracy_score: result.accuracy,
        fluency_score: result.fluency,
        tone: result.tone,
        ai_feedback: result.feedback,
      })
      setScores([...scores, result])
      setStatus('done')
    } catch (error) {
      setStatus('idle')
    } finally {
      setLoading(false)
    }
  }

  const nextQuestion = () => {
    setCurrent(prev => prev + 1)
    setStatus('idle')
    if (current + 1 >= questions.length) {
      localStorage.setItem('scores', JSON.stringify(scores))
      router.push('/results')
    }
  }

  const minutes = Math.floor(timeLeft / 60).toString().padStart(2, '0')
  const seconds = (timeLeft % 60).toString().padStart(2, '0')

  return (
    <div className="min-h-screen bg-[#0a0f0a] text-white p-4 md:p-8 relative overflow-hidden flex flex-col">
      {/* Background Decor */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-10% ] left-[-10%] w-[40%] h-[40%] bg-emerald-600/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-green-600/5 rounded-full blur-[120px]" />
      </div>

      {/* Header Info Bar */}
      <div className="relative z-10 max-w-6xl mx-auto w-full flex flex-wrap items-center justify-between gap-4 mb-8 bg-white/5 border border-white/10 p-4 rounded-3xl backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/20 text-xl">🌿</div>
          <div>
            <h1 className="text-sm font-bold uppercase tracking-widest text-emerald-400">Live Session</h1>
            <p className="text-[10px] text-gray-500 font-medium">TREELYNC AI ENGINE v3.0</p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-center hidden sm:block">
            <p className="text-[10px] text-gray-500 uppercase font-bold tracking-tighter">Progress</p>
            <p className="text-sm font-bold text-white">{current + 1} / {questions.length}</p>
          </div>
          <div className={`px-5 py-2 rounded-2xl border transition-all duration-500 flex items-center gap-3 ${timeLeft < 120 ? 'bg-red-500/10 border-red-500/30 text-red-400 animate-pulse' : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'}`}>
            <span className="text-xs font-bold uppercase tracking-widest">Time Remaining</span>
            <span className="text-xl font-mono font-black">{minutes}:{seconds}</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-6xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 items-start">
        
        {/* Left: Question Area */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 md:p-12 backdrop-blur-3xl relative overflow-hidden min-h-[400px] flex flex-col justify-center">
            <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500/40" />
            <span className="text-emerald-500/60 text-xs font-bold uppercase tracking-[0.3em] mb-4 block">Question Context</span>
            <h2 className="text-2xl md:text-3xl font-bold leading-tight text-white mb-8">
              {questions[current]?.question_text || 'Initializing secure connection...'}
            </h2>
            
            {status === 'done' && scores[current] && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                  <span className="text-xs font-bold uppercase text-emerald-400">Instant AI Feedback</span>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { label: 'Accuracy', val: scores[current]?.accuracy, color: 'text-emerald-400' },
                    { label: 'Fluency', val: scores[current]?.fluency, color: 'text-green-400' },
                    { label: 'Tone', val: scores[current]?.tone, color: 'text-teal-400' },
                  ].map(s => (
                    <div key={s.label}>
                      <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">{s.label}</p>
                      <p className={`text-xl font-black ${s.color}`}>{s.val}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: Monitoring Area */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-4 backdrop-blur-md relative">
            <div className="aspect-video bg-black rounded-[1.5rem] overflow-hidden border border-white/5 relative">
              <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover grayscale-[0.3] opacity-80" />
              
              {/* Overlay UI */}
              <div className="absolute top-4 left-4 flex gap-2">
                <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest backdrop-blur-md border ${recording ? 'bg-red-500/20 border-red-500/40 text-red-400' : 'bg-black/40 border-white/10 text-emerald-400'}`}>
                   {recording ? '● Recording' : '○ Standby'}
                </div>
              </div>
              
              {/* Audio Waveform Block */}
              <div className="bg-white/5 border border-white/10 rounded-3xl p-4 backdrop-blur-md">
                <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest mb-3">🎙 Audio Input</p>
                <canvas ref={canvasRef} width={400} height={80} className="w-full rounded-2xl bg-black/40" /> 
              </div>
            </div>
          </div>

          {/* Action Control Panel */}
          <div className="bg-white/5 border border-white/10 rounded-3xl p-6 flex flex-col gap-4">
             {status === 'idle' && (
                <button onClick={startRecording} className="group relative w-full bg-emerald-500 hover:bg-emerald-400 text-[#0a0f0a] font-black py-5 rounded-2xl transition-all duration-300 shadow-[0_0_20px_rgba(16,185,129,0.2)] overflow-hidden">
                   <span className="relative z-10 flex items-center justify-center gap-3">
                     <span className="text-xl">🎤</span> START RECORDING
                   </span>
                </button>
             )}
             
             {status === 'recording' && (
                <button onClick={stopAndSubmit} className="w-full bg-red-500 hover:bg-red-400 text-white font-black py-5 rounded-2xl transition-all duration-300 shadow-[0_0_20px_rgba(239,68,68,0.2)] flex items-center justify-center gap-3">
                   <div className="w-3 h-3 bg-white rounded-full animate-ping" /> STOP & ANALYZE
                </button>
             )}

             {status === 'processing' && (
                <button disabled className="w-full bg-white/5 border border-white/10 text-gray-400 font-bold py-5 rounded-2xl cursor-wait flex items-center justify-center gap-3">
                   <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                     <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                     <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                   </svg>
                   AI IS EVALUATING...
                </button>
             )}

             {status === 'done' && (
                <button onClick={nextQuestion} className="w-full bg-gradient-to-r from-emerald-600 to-green-500 hover:from-emerald-500 hover:to-green-400 text-white font-black py-5 rounded-2xl transition-all duration-300 flex items-center justify-center gap-3">
                   {current + 1 < questions.length ? 'CONTINUE TO NEXT →' : 'SUBMIT INTERVIEW'}
                </button>
             )}
          </div>
        </div>
      </div>

      {/* Footer Support Info */}
      <footer className="relative z-10 mt-auto pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-gray-600 text-[10px] font-bold uppercase tracking-[0.2em]">
        <div>© 2025 Treelync AI Systems</div>
        <div className="flex items-center gap-2">
           Need help? <a href="mailto:info@treelync.com" className="text-emerald-500/80 hover:text-emerald-400 transition-colors">info@treelync.com</a>
        </div>
        <div>New Delhi, India</div>
      </footer>

      <style jsx global>{`
        @keyframes pulse-soft {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.8; }
        }
        .animate-pulse-soft { animation: pulse-soft 2s infinite; }
      `}</style>
    </div>
  )
}