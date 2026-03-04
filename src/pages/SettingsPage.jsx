import { useState } from 'react'
import { Save, Check, Zap } from 'lucide-react'

const PERSONALITIES = [
  {
    id: 'balanced',
    emoji: '⚖️',
    name: 'Balanced',
    desc: 'Friendly and clear — great for everyday use',
  },
  {
    id: 'professional',
    emoji: '💼',
    name: 'Professional',
    desc: 'Formal and thorough — best for work tasks',
  },
  {
    id: 'casual',
    emoji: '😎',
    name: 'Casual',
    desc: 'Relaxed and fun — like chatting with a friend',
  },
  {
    id: 'concise',
    emoji: '⚡',
    name: 'Concise',
    desc: 'Short and sharp — no fluff, just answers',
  },
  {
    id: 'creative',
    emoji: '🎨',
    name: 'Creative',
    desc: 'Imaginative and expressive — great for ideas',
  },
]

const MODELS = [
  { id: 'llama-3.1-8b-instant', emoji: '⚡', name: 'Fast', desc: 'Quick everyday responses' },
  { id: 'llama-3.3-70b-versatile', emoji: '🧠', name: 'Smart', desc: 'Complex tasks & analysis' },
  { id: 'deepseek-r1-distill-llama-70b', emoji: '🔬', name: 'Reasoning', desc: 'Deep thinking & problems' },
]

function SettingsPage() {
  const [username, setUsername] = useState(
    () => localStorage.getItem('trico-username') || ''
  )
  const [city, setCity] = useState(
    () => localStorage.getItem('trico-city') || ''
  )
  const [personality, setPersonality] = useState(
    () => localStorage.getItem('trico-personality') || 'balanced'
  )
  const [model, setModel] = useState(
    () => localStorage.getItem('trico-model') || 'llama-3.1-8b-instant'
  )
  const [saved, setSaved] = useState(false)

const ALL_INTERESTS = [
  { id: 'technology', label: 'Technology', emoji: '💻' },
  { id: 'science', label: 'Science', emoji: '🔬' },
  { id: 'business', label: 'Business', emoji: '📈' },
  { id: 'health', label: 'Health', emoji: '🏥' },
  { id: 'sports', label: 'Sports', emoji: '⚽' },
  { id: 'entertainment', label: 'Entertainment', emoji: '🎬' },
  { id: 'politics', label: 'Politics', emoji: '🏛️' },
  { id: 'world', label: 'World', emoji: '🌍' },
  { id: 'environment', label: 'Environment', emoji: '🌱' },
  { id: 'food', label: 'Food', emoji: '🍔' },
  { id: 'travel', label: 'Travel', emoji: '✈️' },
  { id: 'gaming', label: 'Gaming', emoji: '🎮' },
]

const [interests, setInterests] = useState(() => {
  const saved = localStorage.getItem('trico-interests')
  return saved ? JSON.parse(saved) : ['technology', 'science']
})

const toggleInterest = (id) => {
  setInterests(prev =>
    prev.includes(id)
      ? prev.filter(i => i !== id)
      : [...prev, id]
  )
}

  const handleSave = () => {
  localStorage.setItem('trico-username', username)
  localStorage.setItem('trico-city', city)
  localStorage.setItem('trico-personality', personality)
  localStorage.setItem('trico-model', model)
  localStorage.setItem('trico-interests', JSON.stringify(interests))
  setSaved(true)
  setTimeout(() => setSaved(false), 2000)
}

  return (
    <div className="flex flex-col h-full overflow-y-auto px-4 md:px-8 py-8">
      <div className="max-w-2xl mx-auto w-full flex flex-col gap-8">

        {/* Header */}
        <div>
          <h1 className="font-display font-bold text-2xl text-gradient">Settings</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            Customize Trico to your preferences
          </p>
        </div>

        {/* Profile */}
        <section className="flex flex-col gap-4">
          <h2
            className="text-xs font-semibold tracking-widest uppercase"
            style={{ color: 'var(--text-faint)' }}
          >
            Profile
          </h2>
          <div
            className="rounded-2xl p-6 border flex flex-col gap-4"
            style={{ background: 'var(--bg-secondary)', borderColor: 'var(--surface-border)' }}
          >
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                Your Name
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => { setUsername(e.target.value) }}
                placeholder="e.g. Mural"
                className="px-4 py-2.5 rounded-xl text-sm outline-none border"
                style={{
                  background: 'var(--bg-tertiary)',
                  borderColor: 'var(--surface-border)',
                  color: 'var(--text-primary)',
                }}
              />
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                Trico will use this to greet you
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                Your City
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => { setCity(e.target.value) }}
                placeholder="e.g. Chennai"
                className="px-4 py-2.5 rounded-xl text-sm outline-none border"
                style={{
                  background: 'var(--bg-tertiary)',
                  borderColor: 'var(--surface-border)',
                  color: 'var(--text-primary)',
                }}
              />
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                Used as fallback if location access is denied
              </p>
            </div>
          </div>
        </section>

        {/* Personality */}
        <section className="flex flex-col gap-4">
          <h2
            className="text-xs font-semibold tracking-widest uppercase"
            style={{ color: 'var(--text-faint)' }}
          >
            Personality
          </h2>
          <div
            className="rounded-2xl p-6 border flex flex-col gap-3"
            style={{ background: 'var(--bg-secondary)', borderColor: 'var(--surface-border)' }}
          >
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              Choose how Trico communicates with you
            </p>
            <div className="flex flex-col gap-2">
              {PERSONALITIES.map(p => (
                <button
                  key={p.id}
                  onClick={() => { setPersonality(p.id) }}
                  className="flex items-center gap-4 px-4 py-3.5 rounded-xl border text-left transition-all duration-150"
                  style={{
                    background: personality === p.id
                      ? 'var(--accent-glow)'
                      : 'var(--bg-tertiary)',
                    borderColor: personality === p.id
                      ? 'var(--accent-primary)'
                      : 'var(--surface-border)',
                  }}
                >
                  <span className="text-2xl">{p.emoji}</span>
                  <div className="flex-1">
                    <p
                      className="text-sm font-semibold"
                      style={{
                        color: personality === p.id
                          ? 'var(--accent-primary)'
                          : 'var(--text-primary)',
                      }}
                    >
                      {p.name}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                      {p.desc}
                    </p>
                  </div>
                  {personality === p.id && (
                    <Check size={16} style={{ color: 'var(--accent-primary)', flexShrink: 0 }} />
                  )}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Model */}
        <section className="flex flex-col gap-4">
          <h2
            className="text-xs font-semibold tracking-widest uppercase"
            style={{ color: 'var(--text-faint)' }}
          >
            AI Model
          </h2>
          <div
            className="rounded-2xl p-6 border flex flex-col gap-3"
            style={{ background: 'var(--bg-secondary)', borderColor: 'var(--surface-border)' }}
          >
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              Select the Groq model powering Trico
            </p>
            <div className="flex flex-col gap-2">
              {MODELS.map(m => (
                <button
                  key={m.id}
                  onClick={() => { setModel(m.id) }}
                  className="flex items-center gap-4 px-4 py-3.5 rounded-xl border text-left transition-all duration-150"
                  style={{
                    background: model === m.id
                      ? 'var(--accent-glow)'
                      : 'var(--bg-tertiary)',
                    borderColor: model === m.id
                      ? 'var(--accent-primary)'
                      : 'var(--surface-border)',
                  }}
                >
                  <span className="text-2xl">{m.emoji}</span>
                  <div className="flex-1">
                    <p
                      className="text-sm font-semibold"
                      style={{
                        color: model === m.id
                          ? 'var(--accent-primary)'
                          : 'var(--text-primary)',
                      }}
                    >
                      {m.name}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                      {m.desc}
                    </p>
                  </div>
                  {model === m.id && (
                    <Check size={16} style={{ color: 'var(--accent-primary)', flexShrink: 0 }} />
                  )}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Interests */}
<section className="flex flex-col gap-4">
  <h2
    className="text-xs font-semibold tracking-widest uppercase"
    style={{ color: 'var(--text-faint)' }}
  >
    News Interests
  </h2>
  <div
    className="rounded-2xl p-6 border flex flex-col gap-4"
    style={{ background: 'var(--bg-secondary)', borderColor: 'var(--surface-border)' }}
  >
    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
      Select topics you want to see in your daily news feed
    </p>
    <div className="flex flex-wrap gap-2">
      {ALL_INTERESTS.map(interest => {
        const active = interests.includes(interest.id)
        return (
          <button
            key={interest.id}
            onClick={() => { toggleInterest(interest.id) }}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm border transition-all duration-150"
            style={{
              background: active ? 'var(--accent-glow)' : 'var(--bg-tertiary)',
              borderColor: active ? 'var(--accent-primary)' : 'var(--surface-border)',
              color: active ? 'var(--accent-primary)' : 'var(--text-muted)',
            }}
          >
            <span>{interest.emoji}</span>
            <span className="font-medium">{interest.label}</span>
            {active && <Check size={12} />}
          </button>
        )
      })}
    </div>
    {interests.length === 0 && (
      <p className="text-xs" style={{ color: '#f87171' }}>
        Select at least one interest to personalize your news feed
      </p>
    )}
    <p className="text-xs" style={{ color: 'var(--text-faint)' }}>
      {interests.length} topic{interests.length !== 1 ? 's' : ''} selected
    </p>
  </div>
</section>

        {/* Save */}
        <button
          onClick={handleSave}
          className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl text-sm font-semibold text-white transition-all glow-sm"
          style={{ background: saved ? '#22c55e' : 'var(--gradient)' }}
        >
          {saved
            ? <><Check size={16} /> Saved!</>
            : <><Save size={16} /> Save Settings</>
          }
        </button>

      </div>
    </div>
  )
}

export default SettingsPage