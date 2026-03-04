import { useState, useRef, useCallback } from 'react'
import { Send, Paperclip, Mic, MicOff } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

function InputBar({ onSend, disabled }) {
  const [input, setInput] = useState('')
  const [isListening, setIsListening] = useState(false)
  const [voiceError, setVoiceError] = useState(null)
  const textareaRef = useRef(null)
  const recognitionRef = useRef(null)

  const handleInput = (e) => {
    setInput(e.target.value)
    const el = textareaRef.current
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 140) + 'px'
  }

  const handleSend = () => {
    const trimmed = input.trim()
    if (!trimmed || disabled) return
    onSend(trimmed)
    setInput('')
    textareaRef.current.style.height = 'auto'
  }

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const startListening = useCallback(() => {
    setVoiceError(null)
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition

    if (!SpeechRecognition) {
      setVoiceError('Not supported in this browser. Use Chrome or Edge.')
      return
    }

    const recognition = new SpeechRecognition()
    recognition.continuous = false
    recognition.interimResults = true
    recognition.lang = 'en-US'

    recognition.onstart = () => { setIsListening(true) }

    recognition.onresult = (event) => {
      let transcript = ''
      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript
      }
      setInput(transcript)

      // Auto resize textarea
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto'
        textareaRef.current.style.height =
          Math.min(textareaRef.current.scrollHeight, 140) + 'px'
      }
    }

    recognition.onerror = (e) => {
      setVoiceError(`Mic error: ${e.error}`)
      setIsListening(false)
    }

    recognition.onend = () => {
      setIsListening(false)
    }

    recognitionRef.current = recognition
    recognition.start()
  }, [])

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
    }
    setIsListening(false)
  }, [])

  const toggleMic = () => {
    if (isListening) {
      stopListening()
    } else {
      startListening()
    }
  }

  return (
    <div className="px-6 pb-6 pt-3 shrink-0">

      {/* Error */}
      <AnimatePresence>
        {voiceError && (
          <motion.p
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-xs text-red-400 mb-2 px-1"
          >
            {voiceError}
          </motion.p>
        )}
      </AnimatePresence>

      {/* Input box */}
      <div
        className="flex items-end gap-3 px-4 py-3 rounded-2xl border transition-all duration-200"
        style={{
          background: 'var(--bg-secondary)',
          borderColor: isListening
            ? 'var(--accent-primary)'
            : 'var(--surface-border)',
          boxShadow: isListening
            ? '0 0 16px var(--accent-glow)'
            : 'none',
        }}
      >
        {/* Attach */}
        <button
          className="shrink-0 w-8 h-8 flex items-center justify-center rounded-xl transition-all"
          style={{ color: 'var(--text-muted)' }}
          title="Attach (coming soon)"
        >
          <Paperclip size={17} />
        </button>

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={input}
          onChange={handleInput}
          onKeyDown={handleKey}
          placeholder={isListening ? 'Listening...' : 'Ask Trico anything...'}
          rows={1}
          disabled={disabled}
          className="flex-1 bg-transparent outline-none resize-none text-sm leading-relaxed max-h-36 disabled:opacity-50 py-0.5"
          style={{ color: 'var(--text-primary)' }}
        />

        {/* Right actions */}
        <div className="flex items-center gap-2 shrink-0">

          {/* Mic toggle */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={toggleMic}
            className="w-8 h-8 flex items-center justify-center rounded-xl transition-all duration-200 relative"
            style={{
              color: isListening ? 'white' : 'var(--text-muted)',
              background: isListening ? 'var(--accent-primary)' : 'transparent',
              boxShadow: isListening ? '0 0 12px var(--accent-glow)' : 'none',
            }}
            title={isListening ? 'Stop listening' : 'Voice input'}
          >
            {/* Pulse ring while listening */}
            {isListening && (
              <motion.div
                className="absolute inset-0 rounded-xl"
                animate={{ scale: [1, 1.4], opacity: [0.4, 0] }}
                transition={{ duration: 1, repeat: Infinity }}
                style={{ background: 'var(--accent-primary)' }}
              />
            )}
            {isListening
              ? <MicOff size={16} />
              : <Mic size={16} />
            }
          </motion.button>

          {/* Send */}
          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.94 }}
            onClick={handleSend}
            disabled={!input.trim() || disabled}
            className="w-10 h-10 flex items-center justify-center rounded-xl text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed glow-sm"
            style={{ background: 'var(--gradient)' }}
          >
            <Send size={15} />
          </motion.button>

        </div>
      </div>

      {/* Hint */}
      <p
        className="text-center text-[11px] mt-2 tracking-wide"
        style={{ color: 'var(--text-faint)' }}
      >
        <kbd
          className="px-1 py-0.5 rounded text-[10px] font-mono"
          style={{ background: 'var(--surface)', color: 'var(--text-muted)' }}
        >
          Enter
        </kbd>
        {' '}to send &nbsp;·&nbsp;{' '}
        <kbd
          className="px-1 py-0.5 rounded text-[10px] font-mono"
          style={{ background: 'var(--surface)', color: 'var(--text-muted)' }}
        >
          Shift+Enter
        </kbd>
        {' '}new line &nbsp;·&nbsp;{' '}
        <kbd
          className="px-1 py-0.5 rounded text-[10px] font-mono"
          style={{ background: 'var(--surface)', color: 'var(--text-muted)' }}
        >
          🎙️
        </kbd>
        {' '}voice input
      </p>
    </div>
  )
}

export default InputBar