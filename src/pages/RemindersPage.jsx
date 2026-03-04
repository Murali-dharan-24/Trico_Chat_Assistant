import { useState, useEffect } from 'react'
import { Plus, Trash2, Bell, BellOff, Check } from 'lucide-react'

function RemindersPage() {
  const [reminders, setReminders] = useState(() =>
    JSON.parse(localStorage.getItem('trico-reminders') || '[]')
  )
  const [title, setTitle] = useState('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [notifPermission, setNotifPermission] = useState(Notification.permission)

  // Request notification permission
  const requestPermission = async () => {
    const result = await Notification.requestPermission()
    setNotifPermission(result)
  }

  // Check reminders every minute
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date()
      const updated = reminders.map(r => {
        if (!r.fired && !r.done) {
          const reminderTime = new Date(`${r.date}T${r.time}`)
          if (now >= reminderTime) {
            // Fire notification
            if (notifPermission === 'granted') {
              new Notification('Trico Reminder 🔔', {
                body: r.title,
                icon: '/favicon.ico',
              })
            }
            return { ...r, fired: true }
          }
        }
        return r
      })
      setReminders(updated)
      localStorage.setItem('trico-reminders', JSON.stringify(updated))
    }, 60000)

    return () => clearInterval(interval)
  }, [reminders, notifPermission])

  const addReminder = () => {
    if (!title.trim() || !date || !time) return
    const reminder = {
      id: Date.now(),
      title: title.trim(),
      date,
      time,
      done: false,
      fired: false,
      createdAt: new Date().toISOString(),
    }
    const updated = [reminder, ...reminders]
    setReminders(updated)
    localStorage.setItem('trico-reminders', JSON.stringify(updated))
    setTitle('')
    setDate('')
    setTime('')
  }

  const toggleDone = (id) => {
    const updated = reminders.map(r =>
      r.id === id ? { ...r, done: !r.done } : r
    )
    setReminders(updated)
    localStorage.setItem('trico-reminders', JSON.stringify(updated))
  }

  const deleteReminder = (id) => {
    const updated = reminders.filter(r => r.id !== id)
    setReminders(updated)
    localStorage.setItem('trico-reminders', JSON.stringify(updated))
  }

  const formatDateTime = (date, time) => {
    return new Date(`${date}T${time}`).toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const isPast = (date, time) => {
    return new Date(`${date}T${time}`) < new Date()
  }

  const pending = reminders.filter(r => !r.done)
  const completed = reminders.filter(r => r.done)

  const inputStyle = {
    background: 'var(--bg-tertiary)',
    borderColor: 'var(--surface-border)',
    color: 'var(--text-primary)',
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto px-8 py-8">
      <div className="max-w-2xl mx-auto w-full flex flex-col gap-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display font-bold text-2xl text-gradient">Reminders</h1>
            <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
              Never forget what matters
            </p>
          </div>

          {/* Notification permission */}
          <button
            onClick={requestPermission}
            className="flex items-center gap-2 px-3 py-2 rounded-xl border text-xs transition-all"
            style={{
              borderColor: notifPermission === 'granted'
                ? 'var(--accent-primary)'
                : 'var(--surface-border)',
              background: notifPermission === 'granted'
                ? 'var(--accent-glow)'
                : 'var(--bg-secondary)',
              color: notifPermission === 'granted'
                ? 'var(--accent-primary)'
                : 'var(--text-muted)',
            }}
          >
            {notifPermission === 'granted'
              ? <><Bell size={13} /> Notifications On</>
              : <><BellOff size={13} /> Enable Notifications</>
            }
          </button>
        </div>

        {/* Add Reminder */}
        <div
          className="rounded-2xl p-6 border"
          style={{ background: 'var(--bg-secondary)', borderColor: 'var(--surface-border)' }}
        >
          <h2 className="font-display font-semibold text-sm mb-4" style={{ color: 'var(--text-primary)' }}>
            New Reminder
          </h2>
          <div className="flex flex-col gap-3">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addReminder()}
              placeholder="What do you want to be reminded of?"
              className="w-full px-4 py-2.5 rounded-xl text-sm outline-none border"
              style={inputStyle}
            />
            <div className="flex gap-3">
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm outline-none border"
                style={inputStyle}
              />
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm outline-none border"
                style={inputStyle}
              />
            </div>
            <button
              onClick={addReminder}
              disabled={!title.trim() || !date || !time}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))' }}
            >
              <Plus size={15} /> Add Reminder
            </button>
          </div>
        </div>

        {/* Pending Reminders */}
        <div
          className="rounded-2xl p-6 border"
          style={{ background: 'var(--bg-secondary)', borderColor: 'var(--surface-border)' }}
        >
          <h2 className="font-display font-semibold text-sm mb-4" style={{ color: 'var(--text-primary)' }}>
            Upcoming · {pending.length}
          </h2>

          {pending.length === 0 ? (
            <p className="text-sm text-center py-4" style={{ color: 'var(--text-muted)' }}>
              No upcoming reminders
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              {pending.map(r => (
                <div
                  key={r.id}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl border"
                  style={{
                    background: 'var(--bg-tertiary)',
                    borderColor: r.fired
                      ? 'rgba(248,113,113,0.3)'
                      : 'var(--surface-border)',
                  }}
                >
                  <button
                    onClick={() => toggleDone(r.id)}
                    className="w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all"
                    style={{
                      borderColor: 'var(--accent-primary)',
                      background: 'transparent',
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                      {r.title}
                    </p>
                    <p
                      className="text-xs mt-0.5"
                      style={{ color: isPast(r.date, r.time) ? '#f87171' : 'var(--text-muted)' }}
                    >
                      {isPast(r.date, r.time) ? '⚠️ ' : '🕐 '}
                      {formatDateTime(r.date, r.time)}
                    </p>
                  </div>
                  {r.fired && (
                    <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(248,113,113,0.15)', color: '#f87171' }}>
                      Fired
                    </span>
                  )}
                  <button onClick={() => deleteReminder(r.id)} style={{ color: 'var(--text-muted)' }}>
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Completed */}
        {completed.length > 0 && (
          <div
            className="rounded-2xl p-6 border"
            style={{ background: 'var(--bg-secondary)', borderColor: 'var(--surface-border)' }}
          >
            <h2 className="font-display font-semibold text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
              Completed · {completed.length}
            </h2>
            <div className="flex flex-col gap-2">
              {completed.map(r => (
                <div
                  key={r.id}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl border"
                  style={{ background: 'var(--bg-tertiary)', borderColor: 'var(--surface-border)' }}
                >
                  <button
                    onClick={() => toggleDone(r.id)}
                    className="w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0"
                    style={{ borderColor: 'var(--accent-primary)', background: 'var(--accent-primary)' }}
                  >
                    <Check size={11} className="text-white" />
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm line-through" style={{ color: 'var(--text-muted)' }}>
                      {r.title}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--text-faint)' }}>
                      {formatDateTime(r.date, r.time)}
                    </p>
                  </div>
                  <button onClick={() => deleteReminder(r.id)} style={{ color: 'var(--text-muted)' }}>
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  )
}

export default RemindersPage