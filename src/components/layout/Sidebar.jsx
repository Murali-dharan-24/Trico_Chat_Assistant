import {
  MessageSquare, Calendar, Clock, Pin,
  Globe, StickyNote, Bell, Trash2, Plus, Settings, Brain
} from 'lucide-react'

const navItems = [
  { icon: MessageSquare, label: 'Chat', id: 'chat' },
  { icon: Calendar, label: 'Today', id: 'today' },
  { icon: Clock, label: 'History', id: 'history' },
  { icon: Pin, label: 'Pinned', id: 'pinned' },
  { icon: Brain, label: 'Memory', id: 'memory' },
]

const toolItems = [
  { icon: Globe, label: 'Web Lookup', id: 'weblookup' },
  { icon: StickyNote, label: 'Notes', id: 'notes' },
  { icon: Bell, label: 'Reminders', id: 'reminders' },
]

function SidebarItem({ icon: Icon, label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200 relative"
      style={{
        background: active ? 'var(--accent-glow)' : 'transparent',
        color: active ? 'var(--accent-primary)' : 'var(--text-muted)',
        borderLeft: active ? '2px solid var(--accent-primary)' : '2px solid transparent',
      }}
    >
      <Icon size={16} />
      <span className="font-medium">{label}</span>
      {active && (
        <div
          className="absolute right-3 w-1.5 h-1.5 rounded-full"
          style={{ background: 'var(--accent-primary)' }}
        />
      )}
    </button>
  )
}

function Sidebar({ activePage, setActivePage, onNewChat }) {
  return (
    <aside
      className="w-56 h-full flex flex-col py-4 px-3 gap-0.5 overflow-y-auto border-r"
      style={{
        background: 'rgba(7,11,20,0.95)',
        backdropFilter: 'blur(20px)',
        borderColor: 'var(--surface-border)',
        minHeight: '100%',
      }}
    >
      {/* New Chat */}
      <button
        onClick={onNewChat}
        className="w-full flex items-center gap-2 px-3 py-2.5 mb-3 rounded-xl text-sm font-semibold text-white transition-all duration-200 glow-sm"
        style={{ background: 'var(--gradient)' }}
      >
        <Plus size={16} />
        New Chat
      </button>

      <p
        className="text-[9px] tracking-widest uppercase px-3 py-2 font-semibold"
        style={{ color: 'var(--text-faint)' }}
      >
        Navigation
      </p>
      {navItems.map(item => (
        <SidebarItem
          key={item.id}
          icon={item.icon}
          label={item.label}
          active={activePage === item.id}
          onClick={() => { setActivePage(item.id) }}
        />
      ))}

      <p
        className="text-[9px] tracking-widest uppercase px-3 py-2 mt-2 font-semibold"
        style={{ color: 'var(--text-faint)' }}
      >
        Tools
      </p>
      {toolItems.map(item => (
        <SidebarItem
          key={item.id}
          icon={item.icon}
          label={item.label}
          active={activePage === item.id}
          onClick={() => { setActivePage(item.id) }}
        />
      ))}

      <div
        className="mt-auto flex flex-col gap-0.5 pt-3 border-t"
        style={{ borderColor: 'var(--surface-border)' }}
      >
        <SidebarItem
          icon={Settings}
          label="Settings"
          active={activePage === 'settings'}
          onClick={() => { setActivePage('settings') }}
        />
        <button
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200"
          style={{ color: 'var(--text-muted)' }}
          onMouseEnter={(e) => { e.currentTarget.style.color = '#f87171' }}
          onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)' }}
          onClick={onNewChat}
        >
          <Trash2 size={16} />
          <span className="font-medium">Clear Chat</span>
        </button>
      </div>
    </aside>
  )
}

export default Sidebar