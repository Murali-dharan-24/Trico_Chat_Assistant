import { useState } from 'react'
import { Trash2, MessageSquare, X, ArrowRight } from 'lucide-react'
import { HistorySkeleton, ListSkeleton } from '../components/ui/Skeleton'

function HistoryPage({ onLoadChat }) {
  const [history, setHistory] = useState(() =>
    JSON.parse(localStorage.getItem('trico-history') || '[]')
  )
  const [selected, setSelected] = useState(null)

  const deleteChat = (id, e) => {
    e.stopPropagation()
    const updated = history.filter(h => h.id !== id)
    setHistory(updated)
    localStorage.setItem('trico-history', JSON.stringify(updated))
    if (selected?.id === id) setSelected(null)
  }

  const clearAll = () => {
    setHistory([])
    localStorage.removeItem('trico-history')
    setSelected(null)
  }

  const formatDate = (iso) => {
    return new Date(iso).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="flex h-full overflow-hidden">

      {/* List */}
      <div
        className="w-72 shrink-0 flex flex-col border-r overflow-y-auto"
        style={{ background: 'var(--bg-secondary)', borderColor: 'var(--surface-border)' }}
      >
        <div
          className="flex items-center justify-between px-4 py-4 border-b shrink-0"
          style={{ borderColor: 'var(--surface-border)' }}
        >
          <h2
            className="font-display font-semibold text-sm"
            style={{ color: 'var(--text-primary)' }}
          >
            History · {history.length}
          </h2>
          {history.length > 0 && (
            <button
              onClick={clearAll}
              className="text-xs px-2 py-1 rounded-lg"
              style={{ color: '#f87171', background: 'rgba(248,113,113,0.1)' }}
            >
              Clear all
            </button>
          )}
        </div>

        <div className="flex flex-col gap-1 p-2">
          {history.length === 0 && (
            <p
              className="text-xs text-center py-8"
              style={{ color: 'var(--text-muted)' }}
            >
              No chat history yet
            </p>
          )}
          {history.map(chat => (
  <div
    key={chat.id}
    onClick={() => { setSelected(chat) }}
    className="w-full text-left px-3 py-3 rounded-xl border transition-all duration-150 group cursor-pointer"
    style={{
      background: selected?.id === chat.id ? 'var(--accent-glow)' : 'transparent',
      borderColor: selected?.id === chat.id
        ? 'var(--accent-primary)'
        : 'transparent',
    }}
  >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <MessageSquare
                    size={13}
                    className="shrink-0"
                    style={{ color: 'var(--accent-primary)' }}
                  />
                  <p
                    className="text-sm truncate font-medium"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {chat.title}
                  </p>
                </div>
                <button
                  onClick={(e) => { deleteChat(chat.id, e) }}
                  className="opacity-0 group-hover:opacity-100 shrink-0"
                  style={{ color: 'var(--text-muted)' }}
                >
                  <Trash2 size={13} />
                </button>
              </div>
              <p
                className="text-[11px] mt-1 ml-5"
                style={{ color: 'var(--text-muted)' }}
              >
                {formatDate(chat.createdAt)} · {chat.messages.length} messages
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Preview */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {selected ? (
          <>
            {/* Toolbar */}
            <div
              className="flex items-center justify-between px-6 py-4 border-b shrink-0"
              style={{ borderColor: 'var(--surface-border)' }}
            >
              <div>
                <p
                  className="font-display font-semibold text-sm"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {selected.title}
                </p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                  {selected.messages.length} messages
                </p>
              </div>
              <div className="flex items-center gap-2">
                {/* Continue chat button */}
                <button
                  onClick={() => { onLoadChat(selected) }}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white glow-sm transition-all"
                  style={{ background: 'var(--gradient)' }}
                >
                  Continue Chat
                  <ArrowRight size={14} />
                </button>
                <button
                  onClick={() => { setSelected(null) }}
                  className="w-8 h-8 flex items-center justify-center rounded-xl border"
                  style={{
                    borderColor: 'var(--surface-border)',
                    color: 'var(--text-muted)',
                  }}
                >
                  <X size={15} />
                </button>
              </div>
            </div>

            
            {/* Messages preview */}
<div className="flex-1 overflow-y-auto px-6 py-4 flex flex-col gap-4">
  {!selected.messages || selected.messages.length === 0
    ? <ListSkeleton count={3} Component={HistorySkeleton} />
    : selected.messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-xs shrink-0 font-bold"
                    style={{
                      background: msg.role === 'user'
                        ? 'var(--accent-glow)'
                        : 'var(--gradient)',
                      color: msg.role === 'user'
                        ? 'var(--accent-primary)'
                        : 'white',
                    }}
                  >
                    {msg.role === 'user' ? 'U' : '⚡'}
                  </div>
                  <div
                    className="px-4 py-3 rounded-2xl text-sm max-w-[75%] border leading-relaxed"
                    style={{
                      background: msg.role === 'user'
                        ? 'var(--accent-glow)'
                        : 'var(--bg-tertiary)',
                      borderColor: msg.role === 'user'
                        ? 'var(--accent-primary)'
                        : 'var(--surface-border)',
                      color: 'var(--text-primary)',
                    }}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full gap-4">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center"
              style={{ background: 'var(--accent-glow)' }}
            >
              <MessageSquare size={28} style={{ color: 'var(--accent-primary)' }} />
            </div>
            <div className="text-center">
              <p
                className="text-sm font-medium"
                style={{ color: 'var(--text-primary)' }}
              >
                Select a chat to preview
              </p>
              <p
                className="text-xs mt-1"
                style={{ color: 'var(--text-muted)' }}
              >
                Click "Continue Chat" to resume any conversation
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default HistoryPage