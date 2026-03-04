import { useState } from 'react'
import { Trash2, Pin } from 'lucide-react'
import ReactMarkdown from 'react-markdown'

function PinnedPage() {
  const [pinned, setPinned] = useState(() =>
    JSON.parse(localStorage.getItem('trico-pinned') || '[]')
  )

  const deletePin = (index) => {
    const updated = pinned.filter((_, i) => i !== index)
    setPinned(updated)
    localStorage.setItem('trico-pinned', JSON.stringify(updated))
  }

  const clearAll = () => {
    setPinned([])
    localStorage.removeItem('trico-pinned')
  }

  const formatDate = (iso) => {
    return new Date(iso).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    })
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto px-8 py-8">
      <div className="max-w-2xl mx-auto w-full flex flex-col gap-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display font-bold text-2xl text-gradient">Pinned</h1>
            <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
              Messages you've saved for later
            </p>
          </div>
          {pinned.length > 0 && (
            <button
              onClick={clearAll}
              className="text-xs px-3 py-1.5 rounded-lg"
              style={{ color: '#f87171', background: 'rgba(248,113,113,0.1)' }}
            >
              Clear all
            </button>
          )}
        </div>

        {/* Pinned list */}
        {pinned.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <span className="text-4xl">📌</span>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              No pinned messages yet
            </p>
            <p className="text-xs text-center max-w-xs" style={{ color: 'var(--text-faint)' }}>
              Hover over any message in chat and click Pin to save it here
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {pinned.map((msg, i) => (
              <div
                key={i}
                className="rounded-2xl p-5 border"
                style={{
                  background: 'var(--bg-secondary)',
                  borderColor: 'var(--surface-border)',
                }}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Pin size={13} style={{ color: 'var(--accent-primary)' }} />
                    <span
                      className="text-xs font-medium px-2 py-0.5 rounded-full"
                      style={{
                        background: 'var(--accent-glow)',
                        color: 'var(--accent-primary)',
                      }}
                    >
                      {msg.role === 'user' ? 'You' : 'Trico'}
                    </span>
                    <span className="text-xs" style={{ color: 'var(--text-faint)' }}>
                      {formatDate(msg.pinnedAt)}
                    </span>
                  </div>
                  <button onClick={() => deletePin(i)} style={{ color: 'var(--text-muted)' }}>
                    <Trash2 size={14} />
                  </button>
                </div>
                <div className="text-sm leading-relaxed" style={{ color: 'var(--text-primary)' }}>
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  )
}

export default PinnedPage