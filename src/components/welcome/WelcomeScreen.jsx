import { motion } from 'framer-motion'
import { Zap, Sparkles } from 'lucide-react'

const suggestions = [
  { emoji: '🌐', label: "What's in tech news today?" },
  { emoji: '📅', label: 'Help me plan my week' },
  { emoji: '⚛️', label: 'Explain quantum computing simply' },
  { emoji: '✉️', label: 'Help me write a professional email' },
  { emoji: '💡', label: 'Give me a creative business idea' },
  { emoji: '🧠', label: 'What can you do?' },
]

function WelcomeScreen({ onSuggestionClick }) {
  return (
    <div className="flex flex-col items-center justify-center h-full px-6 text-center gap-8">

      {/* Avatar */}
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: 'backOut' }}
        className="relative"
      >
        <div
          className="w-24 h-24 rounded-3xl flex items-center justify-center glow-accent"
          style={{ background: 'var(--gradient)' }}
        >
          <Zap size={42} className="text-white" />
        </div>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
          className="absolute -top-2 -right-2 w-7 h-7 rounded-full flex items-center justify-center"
          style={{ background: 'var(--bg-secondary)', border: '2px solid var(--accent-primary)' }}
        >
          <Sparkles size={13} style={{ color: 'var(--accent-primary)' }} />
        </motion.div>
      </motion.div>

      {/* Text */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="flex flex-col gap-3"
      >
        <h2 className="font-display font-bold text-5xl text-gradient">
          Hi, I'm Trico
        </h2>
        <p className="text-base max-w-md leading-relaxed" style={{ color: 'var(--text-muted)' }}>
          Your personal AI assistant. Ask me anything — search the web,
          help you think, write, plan, and much more.
        </p>
      </motion.div>

      {/* Chips */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.35 }}
        className="flex flex-wrap justify-center gap-2 max-w-xl"
      >
        {suggestions.map((s, i) => (
          <motion.button
            key={i}
            whileHover={{ scale: 1.04, y: -2 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => { onSuggestionClick(s.label) }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-full text-sm border transition-all duration-200"
            style={{
              background: 'var(--bg-secondary)',
              borderColor: 'var(--surface-border)',
              color: 'var(--text-muted)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--accent-primary)'
              e.currentTarget.style.color = 'var(--text-primary)'
              e.currentTarget.style.background = 'var(--accent-glow)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--surface-border)'
              e.currentTarget.style.color = 'var(--text-muted)'
              e.currentTarget.style.background = 'var(--bg-secondary)'
            }}
          >
            <span>{s.emoji}</span>
            <span>{s.label}</span>
          </motion.button>
        ))}
      </motion.div>

    </div>
  )
}

export default WelcomeScreen