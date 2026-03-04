import { motion, AnimatePresence } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { useState, useRef, useEffect } from 'react'
import { Zap, Copy, Check, Pin, Volume2, VolumeX, Pencil, BookmarkPlus } from 'lucide-react'

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false)
  const handleCopy = () => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-1 px-2 py-1 rounded-md text-xs transition-all"
      style={{ color: 'var(--text-muted)' }}
    >
      {copied
        ? <><Check size={11} className="text-green-400" /> Copied</>
        : <><Copy size={11} /> Copy</>
      }
    </button>
  )
}

function formatTime(ts) {
  if (!ts) return ''
  const date = new Date(ts)
  const now = new Date()
  const isToday = date.toDateString() === now.toDateString()
  const yesterday = new Date(now)
  yesterday.setDate(now.getDate() - 1)
  const isYesterday = date.toDateString() === yesterday.toDateString()
  const time = date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  })
  if (isToday) return time
  if (isYesterday) return `Yesterday ${time}`
  return date.toLocaleDateString('en-US', {
    month: 'short', day: 'numeric',
  }) + ` ${time}`
}
function MessageBubble({ role, content, timestamp, index, onPin, onSpeak, isSpeaking, onEdit, onSaveToNotes }) {
  const isUser = role === 'user'
  const [pinned, setPinned] = useState(false)
  const [editing, setEditing] = useState(false)
  const [editText, setEditText] = useState(content)
  const textareaRef = useRef(null)

  useEffect(() => {
    if (editing && textareaRef.current) {
      textareaRef.current.focus()
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px'
      // Place cursor at end
      const len = textareaRef.current.value.length
      textareaRef.current.setSelectionRange(len, len)
    }
  }, [editing])

  const handlePin = () => {
    onPin?.({ role, content })
    setPinned(true)
    setTimeout(() => setPinned(false), 2000)
  }

  const handleEditSave = () => {
    const trimmed = editText.trim()
    if (!trimmed || trimmed === content) {
      setEditing(false)
      setEditText(content)
      return
    }
    onEdit?.(index, trimmed)
    setEditing(false)
  }

  const handleEditCancel = () => {
    setEditing(false)
    setEditText(content)
  }

  const handleEditKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleEditSave()
    }
    if (e.key === 'Escape') {
      handleEditCancel()
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={`flex items-end gap-3 group ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
    >
      {/* Avatar */}
      {!isUser ? (
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center glow-sm shrink-0"
          style={{ background: 'var(--gradient)' }}
        >
          <Zap size={14} className="text-white" />
        </div>
      ) : (
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-sm font-bold border"
          style={{
            background: 'var(--accent-glow)',
            borderColor: 'var(--accent-primary)',
            color: 'var(--accent-primary)',
          }}
        >
          U
        </div>
      )}

      {/* Content */}
      <div className={`flex flex-col gap-1.5 max-w-[78%] ${isUser ? 'items-end' : 'items-start'}`}>

        {/* Name + timestamp */}
        <div className={`flex items-center gap-2 px-1 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
          <span
            className="text-[11px] font-medium"
            style={{ color: 'var(--text-muted)' }}
          >
            {isUser ? 'You' : 'Trico'}
          </span>
          {timestamp && (
            <span className="text-[10px]" style={{ color: 'var(--text-faint)' }}>
              {formatTime(timestamp)}
            </span>
          )}
        </div>

        {/* Bubble or Edit box */}
        <AnimatePresence mode="wait">
          {editing ? (
            <motion.div
              key="editing"
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.15 }}
              className="w-full"
              style={{ minWidth: '260px' }}
            >
              <textarea
                ref={textareaRef}
                value={editText}
                onChange={(e) => {
                  setEditText(e.target.value)
                  e.target.style.height = 'auto'
                  e.target.style.height = e.target.scrollHeight + 'px'
                }}
                onKeyDown={handleEditKey}
                className="w-full px-4 py-3 rounded-2xl text-sm outline-none resize-none border leading-relaxed"
                style={{
                  background: 'var(--bg-secondary)',
                  borderColor: 'var(--accent-primary)',
                  color: 'var(--text-primary)',
                  boxShadow: '0 0 0 2px var(--accent-glow)',
                  minHeight: '48px',
                }}
              />
              <div className="flex items-center justify-end gap-2 mt-2">
                <button
                  onClick={handleEditCancel}
                  className="px-3 py-1.5 rounded-lg text-xs border transition-all"
                  style={{
                    borderColor: 'var(--surface-border)',
                    color: 'var(--text-muted)',
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleEditSave}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-white transition-all"
                  style={{ background: 'var(--gradient)' }}
                >
                  Save & Resend
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="bubble"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="px-4 py-3 text-sm leading-relaxed"
              style={isUser ? {
                background: 'var(--gradient)',
                borderRadius: '18px 4px 18px 18px',
                color: 'white',
                boxShadow: '0 4px 20px var(--accent-glow)',
              } : {
                background: 'var(--bg-secondary)',
                border: '1px solid var(--surface-border)',
                borderRadius: '4px 18px 18px 18px',
                color: 'var(--text-primary)',
              }}
            >
              {isUser ? (
                <p>{content}</p>
              ) : (
                <ReactMarkdown
                  components={{
                    code({ node, inline, className, children, ...props }) {
                      const match = /language-(\w+)/.exec(className || '')
                      const codeText = String(children).replace(/\n$/, '')
                      return !inline && match ? (
                        <div
                          className="my-3 rounded-xl overflow-hidden border"
                          style={{ borderColor: 'var(--surface-border)' }}
                        >
                          <div
                            className="flex items-center justify-between px-4 py-2 border-b"
                            style={{
                              background: 'var(--bg-primary)',
                              borderColor: 'var(--surface-border)',
                            }}
                          >
                            <span
                              className="text-xs font-mono font-medium"
                              style={{ color: 'var(--accent-primary)' }}
                            >
                              {match[1]}
                            </span>
                            <CopyButton text={codeText} />
                          </div>
                          <SyntaxHighlighter
                            style={oneDark}
                            language={match[1]}
                            PreTag="div"
                            customStyle={{
                              margin: 0,
                              borderRadius: 0,
                              background: 'var(--bg-primary)',
                              fontSize: '12px',
                            }}
                            {...props}
                          >
                            {codeText}
                          </SyntaxHighlighter>
                        </div>
                      ) : (
                        <code
                          className="px-1.5 py-0.5 rounded-md font-mono text-xs"
                          style={{
                            background: 'var(--surface)',
                            color: 'var(--accent-secondary)',
                          }}
                          {...props}
                        >
                          {children}
                        </code>
                      )
                    },
                    p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                    ul: ({ children }) => (
                      <ul className="list-disc list-inside mb-2 space-y-1 pl-1">{children}</ul>
                    ),
                    ol: ({ children }) => (
                      <ol className="list-decimal list-inside mb-2 space-y-1 pl-1">{children}</ol>
                    ),
                    li: ({ children }) => (
                      <li style={{ color: 'var(--text-primary)' }}>{children}</li>
                    ),
                    strong: ({ children }) => (
                      <strong className="font-semibold" style={{ color: 'var(--accent-secondary)' }}>
                        {children}
                      </strong>
                    ),
                    h1: ({ children }) => (
                      <h1 className="text-lg font-display font-bold mb-2 text-gradient">{children}</h1>
                    ),
                    h2: ({ children }) => (
                      <h2 className="text-base font-display font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                        {children}
                      </h2>
                    ),
                    h3: ({ children }) => (
                      <h3 className="text-sm font-semibold mb-1" style={{ color: 'var(--accent-primary)' }}>
                        {children}
                      </h3>
                    ),
                    blockquote: ({ children }) => (
                      <blockquote
                        className="border-l-2 pl-3 my-2 italic"
                        style={{ borderColor: 'var(--accent-primary)', color: 'var(--text-muted)' }}
                      >
                        {children}
                      </blockquote>
                    ),
                    a: ({ children, href }) => (
                      <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: 'var(--accent-secondary)', textDecoration: 'underline' }}
                      >
                        {children}
                      </a>
                    ),
                  }}
                >
                  {content}
                </ReactMarkdown>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action buttons on hover */}
        {/* Action buttons on hover */}
{!editing && (
  <div className={`flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-150 ${isUser ? 'flex-row-reverse' : ''}`}>

    <button
      onClick={handlePin}
      className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs transition-all"
      style={{ color: pinned ? 'var(--accent-primary)' : 'var(--text-muted)' }}
    >
      <Pin size={11} />
      {pinned ? 'Pinned!' : 'Pin'}
    </button>

    {/* Save to Notes */}
    <button
      onClick={() => { onSaveToNotes?.({ role, content }) }}
      className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs transition-all"
      style={{ color: 'var(--text-muted)' }}
      onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--accent-secondary)' }}
      onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)' }}
    >
      <BookmarkPlus size={11} />
      Save
    </button>

    {/* Edit — only on user messages */}
    {isUser && onEdit && (
      <button
        onClick={() => { setEditing(true) }}
        className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs transition-all"
        style={{ color: 'var(--text-muted)' }}
      >
        <Pencil size={11} />
        Edit
      </button>
    )}

    {/* Speak — only on Trico messages */}
    {!isUser && onSpeak && (
      <button
        onClick={() => { onSpeak(content) }}
        className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs transition-all"
        style={{ color: isSpeaking ? 'var(--accent-primary)' : 'var(--text-muted)' }}
      >
        {isSpeaking
          ? <><VolumeX size={11} /> Stop</>
          : <><Volume2 size={11} /> Speak</>
        }
      </button>
    )}
  </div>
)}
      </div>
      
    </motion.div>
  )
}

export default MessageBubble