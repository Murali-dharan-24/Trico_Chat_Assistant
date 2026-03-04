import { useState, useRef, useEffect } from 'react'
import { Globe, Zap, Menu, X, ChevronDown, Check } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'

const MODELS = [
  {
    id: 'llama-3.1-8b-instant',
    name: 'Fast',
    desc: 'Quick everyday responses',
    badge: '⚡',
  },
  {
    id: 'llama-3.3-70b-versatile',
    name: 'Smart',
    desc: 'Complex tasks & analysis',
    badge: '🧠',
  },
  {
    id: 'deepseek-r1-distill-llama-70b',
    name: 'Reasoning',
    desc: 'Deep thinking & problems',
    badge: '🔬',
  },
]

function Header({ onMenuClick, sidebarOpen, isMobile }) {
  const [webSearch, setWebSearch] = useState(true)
  const [modelOpen, setModelOpen] = useState(false)
  const [selectedModel, setSelectedModel] = useState(
    () => localStorage.getItem('trico-model') || 'llama-3.1-8b-instant'
  )
  const { themeName, setThemeName, themes } = useTheme()
  const dropdownRef = useRef(null)

  const currentModel = MODELS.find(m => m.id === selectedModel) || MODELS[0]

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setModelOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const selectModel = (id) => {
    setSelectedModel(id)
    localStorage.setItem('trico-model', id)
    setModelOpen(false)
  }

  return (
    <header
      className="px-4 md:px-6 py-3 flex items-center justify-between z-10 shrink-0 border-b"
      style={{
        background: 'rgba(7,11,20,0.85)',
        backdropFilter: 'blur(20px)',
        borderColor: 'var(--surface-border)',
      }}
    >
      {/* Left */}
      <div className="flex items-center gap-3">

        {/* Hamburger — mobile only */}
        {isMobile && (
          <button
            onClick={onMenuClick}
            className="w-8 h-8 flex items-center justify-center rounded-xl transition-all"
            style={{ color: 'var(--text-muted)', background: 'var(--surface)' }}
          >
            {sidebarOpen ? <X size={17} /> : <Menu size={17} />}
          </button>
        )}

        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center glow-accent"
            style={{ background: 'var(--gradient)' }}
          >
            <Zap size={16} className="text-white" />
          </div>
          <div>
            <h1 className="font-display font-bold text-lg leading-none tracking-widest text-gradient">
              TRICO
            </h1>
            <p
              className="text-[9px] tracking-widest uppercase mt-0.5"
              style={{ color: 'var(--text-muted)' }}
            >
              Personal Intelligence
            </p>
          </div>
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2">

        {/* Status */}
        {!isMobile && (
          <div
            className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs border"
            style={{ borderColor: 'var(--surface-border)', color: 'var(--text-muted)' }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            Online
          </div>
        )}

        {/* Model selector */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => { setModelOpen(!modelOpen) }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs border transition-all duration-200"
            style={{
              borderColor: modelOpen
                ? 'var(--accent-primary)'
                : 'var(--surface-border)',
              background: modelOpen ? 'var(--accent-glow)' : 'var(--bg-secondary)',
              color: 'var(--text-primary)',
            }}
          >
            <span>{currentModel.badge}</span>
            {!isMobile && (
              <span className="font-medium">{currentModel.name}</span>
            )}
            <ChevronDown
              size={12}
              style={{
                color: 'var(--text-muted)',
                transform: modelOpen ? 'rotate(180deg)' : 'rotate(0)',
                transition: 'transform 0.2s',
              }}
            />
          </button>

          {/* Dropdown */}
          {modelOpen && (
            <div
              className="absolute right-0 top-full mt-2 rounded-2xl border overflow-hidden z-50"
              style={{
                background: 'var(--bg-secondary)',
                borderColor: 'var(--surface-border)',
                width: '220px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
              }}
            >
              <div
                className="px-3 py-2 border-b text-[10px] tracking-widest uppercase font-semibold"
                style={{
                  borderColor: 'var(--surface-border)',
                  color: 'var(--text-faint)',
                }}
              >
                Select Model
              </div>
              {MODELS.map(model => (
                <button
                  key={model.id}
                  onClick={() => { selectModel(model.id) }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left transition-all duration-150"
                  style={{
                    background: selectedModel === model.id
                      ? 'var(--accent-glow)'
                      : 'transparent',
                  }}
                  onMouseEnter={(e) => {
                    if (selectedModel !== model.id) {
                      e.currentTarget.style.background = 'var(--surface)'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedModel !== model.id) {
                      e.currentTarget.style.background = 'transparent'
                    }
                  }}
                >
                  <span className="text-lg">{model.badge}</span>
                  <div className="flex-1 min-w-0">
                    <p
                      className="text-sm font-medium"
                      style={{
                        color: selectedModel === model.id
                          ? 'var(--accent-primary)'
                          : 'var(--text-primary)',
                      }}
                    >
                      {model.name}
                    </p>
                    <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                      {model.desc}
                    </p>
                  </div>
                  {selectedModel === model.id && (
                    <Check size={14} style={{ color: 'var(--accent-primary)', flexShrink: 0 }} />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Web Search Toggle */}
        <button
          onClick={() => { setWebSearch(!webSearch) }}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs border transition-all duration-200"
          style={{
            borderColor: webSearch ? 'var(--accent-primary)' : 'var(--surface-border)',
            background: webSearch ? 'var(--accent-glow)' : 'transparent',
            color: webSearch ? 'var(--accent-primary)' : 'var(--text-muted)',
          }}
        >
          <Globe size={12} />
          {!isMobile && <span>Web</span>}
          <div
            className="w-6 h-3.5 rounded-full relative transition-all duration-200"
            style={{ background: webSearch ? 'var(--accent-primary)' : 'var(--surface)' }}
          >
            <div
              className="absolute top-0.5 w-2.5 h-2.5 rounded-full bg-white transition-all duration-200"
              style={{ left: webSearch ? '12px' : '2px' }}
            />
          </div>
        </button>

        {/* Theme picker */}
        <div
          className="flex items-center gap-1 px-2 py-1.5 rounded-full border"
          style={{ borderColor: 'var(--surface-border)' }}
        >
          {Object.entries(themes).map(([key, t]) => (
            <button
              key={key}
              onClick={() => { setThemeName(key) }}
              title={t.name}
              className="w-3.5 h-3.5 rounded-full transition-all duration-150"
              style={{
                background: t.accent.primary,
                transform: themeName === key ? 'scale(1.4)' : 'scale(1)',
                boxShadow: themeName === key ? `0 0 6px ${t.accent.primary}` : 'none',
              }}
            />
          ))}
        </div>

      </div>
    </header>
  )
}

export default Header