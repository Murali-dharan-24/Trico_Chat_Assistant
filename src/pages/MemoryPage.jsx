import { useState, useEffect } from 'react'
import { Trash2, Brain, Plus, X } from 'lucide-react'
import { loadMemories, deleteMemory, clearMemories, saveMemory } from '../lib/memory'
import { MemorySkeleton, ListSkeleton } from '../components/ui/Skeleton'

function MemoryPage() {
  const [memories, setMemories] = useState([])
  const [loading, setLoading] = useState(true)
  const [newFact, setNewFact] = useState('')
  const [showAdd, setShowAdd] = useState(false)

  useEffect(() => {
    // Simulate brief load so skeleton shows
    const timer = setTimeout(() => {
      setMemories(loadMemories())
      setLoading(false)
    }, 600)
    return () => clearTimeout(timer)
  }, [])

  const handleDelete = (id) => {
    deleteMemory(id)
    setMemories(loadMemories())
  }

  const handleClearAll = () => {
    clearMemories()
    setMemories([])
  }

  const handleAdd = () => {
    if (!newFact.trim()) return
    saveMemory(newFact.trim())
    setMemories(loadMemories())
    setNewFact('')
    setShowAdd(false)
  }

  const formatDate = (iso) => {
    return new Date(iso).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto px-4 md:px-8 py-8">
      <div className="max-w-2xl mx-auto w-full flex flex-col gap-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display font-bold text-2xl text-gradient">Memory</h1>
            <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
              What Trico knows about you
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => { setShowAdd(!showAdd) }}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-white glow-sm"
              style={{ background: 'var(--gradient)' }}
            >
              <Plus size={14} /> Add
            </button>
            {memories.length > 0 && (
              <button
                onClick={handleClearAll}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm border"
                style={{
                  borderColor: 'rgba(248,113,113,0.3)',
                  background: 'rgba(248,113,113,0.08)',
                  color: '#f87171',
                }}
              >
                <Trash2 size={14} /> Clear All
              </button>
            )}
          </div>
        </div>

        {/* Add memory input */}
        {showAdd && (
          <div
            className="rounded-2xl p-5 border"
            style={{ background: 'var(--bg-secondary)', borderColor: 'var(--accent-primary)' }}
          >
            <p className="text-sm font-medium mb-3" style={{ color: 'var(--text-primary)' }}>
              Manually add a memory
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                value={newFact}
                onChange={(e) => { setNewFact(e.target.value) }}
                onKeyDown={(e) => { if (e.key === 'Enter') handleAdd() }}
                placeholder="e.g. User prefers dark themes..."
                className="flex-1 px-4 py-2.5 rounded-xl text-sm outline-none border"
                style={{
                  background: 'var(--bg-tertiary)',
                  borderColor: 'var(--surface-border)',
                  color: 'var(--text-primary)',
                }}
                autoFocus
              />
              <button
                onClick={handleAdd}
                disabled={!newFact.trim()}
                className="px-4 py-2 rounded-xl text-sm font-medium text-white disabled:opacity-40"
                style={{ background: 'var(--gradient)' }}
              >
                Save
              </button>
              <button
                onClick={() => { setShowAdd(false) }}
                className="w-9 h-9 flex items-center justify-center rounded-xl border"
                style={{ borderColor: 'var(--surface-border)', color: 'var(--text-muted)' }}
              >
                <X size={15} />
              </button>
            </div>
          </div>
        )}

        {/* How it works */}
        <div
          className="rounded-2xl p-5 border"
          style={{ background: 'var(--bg-secondary)', borderColor: 'var(--surface-border)' }}
        >
          <div className="flex items-center gap-2 mb-3">
            <Brain size={16} style={{ color: 'var(--accent-primary)' }} />
            <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
              How Trico's memory works
            </p>
          </div>
          <div className="flex flex-col gap-2 text-xs" style={{ color: 'var(--text-muted)' }}>
            <p>🧠 Trico <strong style={{ color: 'var(--accent-primary)' }}>automatically learns</strong> from your conversations.</p>
            <p>💬 Every reply is analyzed in the background for facts worth remembering.</p>
            <p>✨ Memories are <strong style={{ color: 'var(--accent-primary)' }}>injected into every chat</strong> so Trico always knows you.</p>
            <p>🗑️ Delete any memory or add your own manually anytime.</p>
          </div>
        </div>

        {/* Count */}
        {!loading && memories.length > 0 && (
          <div className="flex items-center justify-between px-1">
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              {memories.length} memories stored
            </p>
            <p className="text-xs" style={{ color: 'var(--text-faint)' }}>
              Max 50 memories
            </p>
          </div>
        )}

        {/* Skeleton */}
        {loading && <ListSkeleton count={4} Component={MemorySkeleton} />}

        {/* Empty */}
        {!loading && memories.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 gap-4">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center"
              style={{ background: 'var(--accent-glow)' }}
            >
              <Brain size={28} style={{ color: 'var(--accent-primary)' }} />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                No memories yet
              </p>
              <p className="text-xs mt-1 max-w-xs" style={{ color: 'var(--text-muted)' }}>
                Start chatting and Trico will automatically learn things about you.
              </p>
            </div>
          </div>
        )}

        {/* Memories list */}
        {!loading && memories.length > 0 && (
          <div className="flex flex-col gap-2">
            {memories.map((memory) => (
              <div
                key={memory.id}
                className="flex items-start gap-3 px-4 py-3.5 rounded-xl border group transition-all duration-150"
                style={{
                  background: 'var(--bg-secondary)',
                  borderColor: 'var(--surface-border)',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--accent-primary)' }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--surface-border)' }}
              >
                <div
                  className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                  style={{ background: 'var(--accent-glow)' }}
                >
                  <Brain size={12} style={{ color: 'var(--accent-primary)' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--text-primary)' }}>
                    {memory.fact}
                  </p>
                  <p className="text-[11px] mt-1" style={{ color: 'var(--text-faint)' }}>
                    Learned {formatDate(memory.createdAt)}
                  </p>
                </div>
                <button
                  onClick={() => { handleDelete(memory.id) }}
                  className="opacity-0 group-hover:opacity-100 w-7 h-7 flex items-center justify-center rounded-lg transition-all shrink-0"
                  style={{ color: '#f87171', background: 'rgba(248,113,113,0.1)' }}
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  )
}

export default MemoryPage