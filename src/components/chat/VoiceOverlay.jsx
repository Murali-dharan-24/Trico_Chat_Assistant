import { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mic, Volume2, MicOff } from 'lucide-react'

function VoiceOverlay({ isListening, isSpeaking, voiceModeOn, onToggle, error }) {
  const canvasRef = useRef(null)
  const animFrameRef = useRef(null)
  const analyserRef = useRef(null)
  const streamRef = useRef(null)

  useEffect(() => {
    if (isListening) {
      startWaveform()
    } else {
      stopWaveform()
    }
    return () => stopWaveform()
  }, [isListening])

  const startWaveform = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)()
      const source = audioCtx.createMediaStreamSource(stream)
      const analyser = audioCtx.createAnalyser()
      analyser.fftSize = 256
      source.connect(analyser)
      analyserRef.current = analyser
      drawWaveform()
    } catch (err) {
      console.warn('Waveform error:', err)
    }
  }

  const stopWaveform = () => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop())
      streamRef.current = null
    }
  }

  const drawWaveform = () => {
    const canvas = canvasRef.current
    if (!canvas || !analyserRef.current) return
    const ctx = canvas.getContext('2d')
    const analyser = analyserRef.current
    const bufferLength = analyser.frequencyBinCount
    const dataArray = new Uint8Array(bufferLength)

    const draw = () => {
      animFrameRef.current = requestAnimationFrame(draw)
      analyser.getByteFrequencyData(dataArray)
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      const barWidth = (canvas.width / bufferLength) * 2.5
      let x = 0
      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * canvas.height * 0.8
        const hue = 220 + (i / bufferLength) * 60
        ctx.fillStyle = `hsla(${hue}, 90%, 65%, 0.85)`
        ctx.beginPath()
        ctx.roundRect(x, (canvas.height - barHeight) / 2, barWidth - 2, barHeight, 4)
        ctx.fill()
        x += barWidth
      }
    }
    draw()
  }

  const show = voiceModeOn && (isListening || isSpeaking)

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: 'rgba(7,11,20,0.92)', backdropFilter: 'blur(20px)' }}
        >
          <motion.div
            initial={{ scale: 0.85, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.85, opacity: 0, y: 30 }}
            transition={{ duration: 0.4, ease: 'backOut' }}
            className="flex flex-col items-center gap-8 p-10 rounded-3xl border"
            style={{
              background: 'var(--bg-secondary)',
              borderColor: 'var(--surface-border)',
              width: '480px',
            }}
          >
            {/* Icon with pulse */}
            <div className="relative flex items-center justify-center">
              <motion.div
                animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0, 0.3] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="absolute w-24 h-24 rounded-full"
                style={{ background: 'var(--accent-glow)' }}
              />
              <motion.div
                animate={{ scale: [1, 1.25, 1], opacity: [0.2, 0, 0.2] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}
                className="absolute w-32 h-32 rounded-full"
                style={{ background: 'var(--accent-glow)' }}
              />
              <div
                className="relative w-16 h-16 rounded-full flex items-center justify-center glow-accent z-10"
                style={{ background: 'var(--gradient)' }}
              >
                {isListening
                  ? <Mic size={28} className="text-white" />
                  : <Volume2 size={28} className="text-white" />
                }
              </div>
            </div>

            {/* Status */}
            <div className="text-center">
              <p
                className="font-display font-bold text-xl"
                style={{ color: 'var(--text-primary)' }}
              >
                {isListening ? 'Listening...' : 'Trico is speaking...'}
              </p>
              <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
                {isListening
                  ? 'Speak clearly — I\'m capturing your voice'
                  : 'Trico will listen when done speaking'
                }
              </p>
            </div>

            {/* Waveform — only while listening */}
            {isListening && (
              <canvas
                ref={canvasRef}
                width={400}
                height={80}
                className="rounded-xl w-full"
                style={{ background: 'var(--bg-tertiary)' }}
              />
            )}

            {/* Speaking animation */}
            {isSpeaking && !isListening && (
              <div className="flex items-end gap-1.5 h-14">
                {[...Array(12)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="w-2 rounded-full"
                    style={{ background: 'var(--accent-primary)' }}
                    animate={{ height: ['8px', `${20 + Math.random() * 40}px`, '8px'] }}
                    transition={{
                      duration: 0.6 + Math.random() * 0.4,
                      repeat: Infinity,
                      delay: i * 0.08,
                      ease: 'easeInOut',
                    }}
                  />
                ))}
              </div>
            )}

            {/* Error */}
            {error && (
              <p className="text-sm text-red-400 text-center">{error}</p>
            )}

            {/* Turn off voice mode */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onToggle}
              className="flex items-center gap-2 px-6 py-3 rounded-xl border text-sm font-medium"
              style={{
                borderColor: 'rgba(248,113,113,0.4)',
                background: 'rgba(248,113,113,0.1)',
                color: '#f87171',
              }}
            >
              <MicOff size={16} />
              Turn Off Voice Mode
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default VoiceOverlay