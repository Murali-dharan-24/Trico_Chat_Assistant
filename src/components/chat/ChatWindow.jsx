import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import MessageBubble from './MessageBubble'
import TypingIndicator from './TypingIndicator'
import InputBar from './InputBar'
import WelcomeScreen from '../welcome/WelcomeScreen'
import { Brain, Copy, Check, RefreshCw, Sparkles, X, BookmarkPlus } from 'lucide-react'
import { useVoiceOutput } from '../../hooks/useVoiceOutput'

function ChatWindow({ messages, isThinking, isExtracting, onSend, onPin, onRegenerate, onEdit, }) {
  const bottomRef = useRef(null)
  const { isSpeaking, speak, stop } = useVoiceOutput()
  const [copied, setCopied] = useState(false)
  const [regenerating, setRegenerating] = useState(false)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isThinking])

  const handleSpeak = (content) => {
    if (isSpeaking) {
      stop()
    } else {
      speak(content)
    }
  }

  const copyConversation = () => {
    if (messages.length === 0) return
    const text = messages
      .map(msg => {
        const role = msg.role === 'user' ? 'You' : 'Trico'
        return `${role}:\n${msg.content}`
      })
      .join('\n\n---\n\n')

    const header = `Trico Conversation — ${new Date().toLocaleDateString('en-US', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    })}\n\n${'='.repeat(50)}\n\n`

    navigator.clipboard.writeText(header + text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const handleRegenerate = async () => {
    setRegenerating(true)
    await onRegenerate()
    setRegenerating(false)
  }

  const [savedNote, setSavedNote] = useState(null)

const saveToNotes = ({ role, content }) => {
  const existing = JSON.parse(localStorage.getItem('trico-notes') || '[]')
  const label = role === 'user' ? 'My message' : 'Trico'
  const note = {
    id: Date.now(),
    title: `${label} — ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
    content: `<p>${content.replace(/\n/g, '</p><p>')}</p>`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  localStorage.setItem('trico-notes', JSON.stringify([note, ...existing]))
  setSavedNote(note.id)
  setTimeout(() => setSavedNote(null), 2500)
}

  // Show regenerate if last message is from assistant
  const canRegenerate = messages.length >= 2 &&
    messages[messages.length - 1]?.role === 'assistant' &&
    !isThinking

  return (
    <div className="flex flex-col h-full overflow-hidden">

      {/* Toolbar */}
      <div
        className="flex items-center justify-between px-4 md:px-6 py-2 border-b shrink-0"
        style={{ borderColor: 'var(--surface-border)' }}
      >
        {/* Memory indicator */}
        {isExtracting ? (
          <div
            className="flex items-center gap-2 text-xs"
            style={{ color: 'var(--accent-primary)' }}
          >
            <Brain size={11} className="animate-pulse" />
            Updating memory...
          </div>
        ) : (
          <div />
        )}

        {/* Right actions */}
        <div className="flex items-center gap-2">

          {/* Regenerate */}
          {canRegenerate && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={handleRegenerate}
              disabled={regenerating}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs border transition-all duration-200 disabled:opacity-40"
              style={{
                borderColor: 'var(--surface-border)',
                background: 'transparent',
                color: 'var(--text-muted)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--accent-primary)'
                e.currentTarget.style.color = 'var(--accent-primary)'
                e.currentTarget.style.background = 'var(--accent-glow)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--surface-border)'
                e.currentTarget.style.color = 'var(--text-muted)'
                e.currentTarget.style.background = 'transparent'
              }}
            >
              <RefreshCw
                size={12}
                className={regenerating ? 'animate-spin' : ''}
              />
              {regenerating ? 'Regenerating...' : 'Regenerate'}
            </motion.button>
          )}

          {/* Copy chat */}
          {messages.length > 0 && (
            <button
              onClick={copyConversation}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs border transition-all duration-200"
              style={{
                borderColor: copied
                  ? 'rgba(74,222,128,0.4)'
                  : 'var(--surface-border)',
                background: copied
                  ? 'rgba(74,222,128,0.08)'
                  : 'transparent',
                color: copied ? '#4ade80' : 'var(--text-muted)',
              }}
            >
              {copied
                ? <><Check size={12} /> Copied!</>
                : <><Copy size={12} /> Copy Chat</>
              }
            </button>
          )}
        </div>
      </div>

      {/* Memory banner */}
      <AnimatePresence>
        {isExtracting && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="flex items-center gap-2 px-6 text-xs border-b overflow-hidden shrink-0"
            style={{
              background: 'var(--accent-glow)',
              borderColor: 'var(--surface-border)',
              color: 'var(--accent-primary)',
              paddingTop: '6px',
              paddingBottom: '6px',
            }}
          >
            <Brain size={11} className="animate-pulse" />
            Trico is updating memory...
          </motion.div>
        )}
      </AnimatePresence>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-3 md:px-6 py-4 md:py-6">
        {messages.length === 0 ? (
          <WelcomeScreen onSuggestionClick={onSend} />
        ) : (
          <div className="flex flex-col gap-6 max-w-3xl mx-auto">
            <AnimatePresence initial={false}>
              {messages.map((msg, i) => (
                <MessageBubble
                  key={i}
                  role={msg.role}
                  content={msg.content}
                  timestamp={msg.timestamp}
                  onPin={onPin}
                  onSpeak={handleSpeak}
                  isSpeaking={isSpeaking && i === messages.length - 1}
                  onEdit={onEdit}
                  onSaveToNotes={saveToNotes}
                />
              ))}
              {isThinking && <TypingIndicator key="typing" />}
            </AnimatePresence>
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      <InputBar onSend={onSend} disabled={isThinking} />
      {/* Saved to notes toast */}
<AnimatePresence>
  {savedNote && (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      transition={{ duration: 0.25 }}
      className="fixed bottom-24 left-1/2 flex items-center gap-2 px-4 py-3 rounded-2xl border text-sm font-medium z-50"
      style={{
        transform: 'translateX(-50%)',
        background: 'var(--bg-secondary)',
        borderColor: 'var(--accent-secondary)',
        color: 'var(--text-primary)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
      }}
    >
      <BookmarkPlus size={15} style={{ color: 'var(--accent-secondary)' }} />
      Saved to Notes!
    </motion.div>
  )}
</AnimatePresence>
    </div>
  )
}

export default ChatWindow