import { useState, useEffect, useRef } from 'react'
import {
  Plus, Trash2, Save, FileText,
  Bold, Italic, List, ListOrdered,
  Heading2, Quote, Code, Minus, Download
} from 'lucide-react'

function NotesPage() {
  const [notes, setNotes] = useState(() =>
    JSON.parse(localStorage.getItem('trico-notes') || '[]')
  )
  const [selected, setSelected] = useState(null)
  const [title, setTitle] = useState('')
  const [saved, setSaved] = useState(false)
  const editorRef = useRef(null)

  useEffect(() => {
    if (selected) {
      setTitle(selected.title)
      if (editorRef.current) {
        editorRef.current.innerHTML = selected.content || ''
      }
    }
  }, [selected])

  const saveNote = () => {
    if (!selected) return
    const content = editorRef.current?.innerHTML || ''
    const updated = notes.map(n =>
      n.id === selected.id
        ? { ...n, title: title || 'Untitled', content, updatedAt: new Date().toISOString() }
        : n
    )
    setNotes(updated)
    localStorage.setItem('trico-notes', JSON.stringify(updated))
    setSelected(prev => ({ ...prev, title: title || 'Untitled', content }))
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const exportAsText = () => {
  if (!selected) return
  const plainText = getPlainText(editorRef.current?.innerHTML || selected.content || '')
  const content = `${title}\n${'='.repeat(title.length)}\n\n${plainText}\n\nExported from Trico — ${new Date().toLocaleDateString()}`
  const blob = new Blob([content], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${title || 'note'}.txt`
  a.click()
  URL.revokeObjectURL(url)
}

const exportAsPDF = () => {
  if (!selected) return
  const content = editorRef.current?.innerHTML || selected.content || ''

  const printWindow = window.open('', '_blank')
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>${title || 'Note'}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono&display=swap');
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body {
            font-family: 'Inter', sans-serif;
            font-size: 14px;
            line-height: 1.7;
            color: #1a1a2e;
            padding: 48px;
            max-width: 800px;
            margin: 0 auto;
          }
          .header {
            border-bottom: 2px solid #3b82f6;
            padding-bottom: 16px;
            margin-bottom: 32px;
          }
          .title {
            font-family: 'Syne', sans-serif;
            font-size: 28px;
            font-weight: 700;
            color: #0f172a;
            margin-bottom: 6px;
          }
          .meta {
            font-size: 12px;
            color: #64748b;
          }
          .trico-badge {
            display: inline-block;
            background: linear-gradient(135deg, #3b82f6, #8b5cf6);
            color: white;
            font-size: 10px;
            font-weight: 600;
            padding: 2px 8px;
            border-radius: 20px;
            margin-right: 8px;
            letter-spacing: 1px;
            text-transform: uppercase;
          }
          h2 {
            font-family: 'Syne', sans-serif;
            font-size: 18px;
            font-weight: 700;
            color: #0f172a;
            margin: 24px 0 8px;
          }
          p { margin-bottom: 10px; }
          strong { font-weight: 600; }
          em { font-style: italic; color: #475569; }
          ul, ol { padding-left: 24px; margin-bottom: 12px; }
          li { margin-bottom: 4px; }
          blockquote {
            border-left: 3px solid #3b82f6;
            padding-left: 16px;
            margin: 16px 0;
            color: #475569;
            font-style: italic;
          }
          pre {
            background: #f1f5f9;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 12px 16px;
            font-family: 'JetBrains Mono', monospace;
            font-size: 12px;
            overflow-x: auto;
            margin: 12px 0;
          }
          hr {
            border: none;
            border-top: 1px solid #e2e8f0;
            margin: 20px 0;
          }
          @media print {
            body { padding: 24px; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="title">${title || 'Untitled'}</div>
          <div class="meta">
            <span class="trico-badge">Trico</span>
            Exported on ${new Date().toLocaleDateString('en-US', {
              weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
            })}
          </div>
        </div>
        <div class="content">${content}</div>
      </body>
    </html>
  `)
  printWindow.document.close()
  printWindow.focus()
  setTimeout(() => {
    printWindow.print()
    printWindow.close()
  }, 500)
}

  const createNote = () => {
    const note = {
      id: Date.now(),
      title: 'New Note',
      content: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    const updated = [note, ...notes]
    setNotes(updated)
    localStorage.setItem('trico-notes', JSON.stringify(updated))
    setSelected(note)
    setTitle('New Note')
    setTimeout(() => {
      if (editorRef.current) {
        editorRef.current.innerHTML = ''
        editorRef.current.focus()
      }
    }, 50)
  }

  const deleteNote = (id, e) => {
    e.stopPropagation()
    const updated = notes.filter(n => n.id !== id)
    setNotes(updated)
    localStorage.setItem('trico-notes', JSON.stringify(updated))
    if (selected?.id === id) {
      setSelected(null)
      setTitle('')
    }
  }

  const formatDate = (iso) => {
    return new Date(iso).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric',
    })
  }

  // Rich text commands
  const exec = (command, value = null) => {
    editorRef.current?.focus()
    document.execCommand(command, false, value)
  }

  const formatHeading = () => {
    const selection = window.getSelection()
    if (!selection.rangeCount) return
    const range = selection.getRangeAt(0)
    const block = range.commonAncestorContainer.parentElement
    if (block.tagName === 'H2') {
      exec('formatBlock', 'p')
    } else {
      exec('formatBlock', 'h2')
    }
  }

  const insertDivider = () => {
    editorRef.current?.focus()
    exec('insertHTML', '<hr/><p><br/></p>')
  }

  const toolbarButtons = [
    { icon: Bold, title: 'Bold', action: () => exec('bold') },
    { icon: Italic, title: 'Italic', action: () => exec('italic') },
    { icon: Heading2, title: 'Heading', action: formatHeading },
    { icon: List, title: 'Bullet List', action: () => exec('insertUnorderedList') },
    { icon: ListOrdered, title: 'Numbered List', action: () => exec('insertOrderedList') },
    { icon: Quote, title: 'Blockquote', action: () => exec('formatBlock', 'blockquote') },
    { icon: Code, title: 'Code', action: () => exec('formatBlock', 'pre') },
    { icon: Minus, title: 'Divider', action: insertDivider },
  ]

  const getPlainText = (html) => {
    const div = document.createElement('div')
    div.innerHTML = html
    return div.textContent || div.innerText || ''
  }

  return (
    <div className="flex h-full overflow-hidden">

      {/* Sidebar */}
      <div
        className="w-64 shrink-0 flex flex-col border-r overflow-hidden"
        style={{ background: 'var(--bg-secondary)', borderColor: 'var(--surface-border)' }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-4 py-4 border-b shrink-0"
          style={{ borderColor: 'var(--surface-border)' }}
        >
          <h2
            className="font-display font-semibold text-sm"
            style={{ color: 'var(--text-primary)' }}
          >
            Notes · {notes.length}
          </h2>
          <button
            onClick={createNote}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-white glow-sm"
            style={{ background: 'var(--gradient)' }}
          >
            <Plus size={14} />
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-1">
          {notes.length === 0 && (
            <p
              className="text-xs text-center py-8"
              style={{ color: 'var(--text-muted)' }}
            >
              No notes yet — create one!
            </p>
          )}
          {notes.map(note => (
            <div
              key={note.id}
              onClick={() => { setSelected(note) }}
              className="flex items-start justify-between gap-2 px-3 py-3 rounded-xl border cursor-pointer transition-all duration-150 group"
              style={{
                background: selected?.id === note.id
                  ? 'var(--accent-glow)'
                  : 'transparent',
                borderColor: selected?.id === note.id
                  ? 'var(--accent-primary)'
                  : 'transparent',
              }}
              onMouseEnter={(e) => {
                if (selected?.id !== note.id) {
                  e.currentTarget.style.background = 'var(--surface)'
                }
              }}
              onMouseLeave={(e) => {
                if (selected?.id !== note.id) {
                  e.currentTarget.style.background = 'transparent'
                }
              }}
            >
              <div className="flex items-start gap-2 min-w-0">
                <FileText
                  size={13}
                  className="shrink-0 mt-0.5"
                  style={{ color: 'var(--accent-primary)' }}
                />
                <div className="min-w-0">
                  <p
                    className="text-sm font-medium truncate"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {note.title || 'Untitled'}
                  </p>
                  <p
                    className="text-[11px] truncate mt-0.5"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    {getPlainText(note.content).slice(0, 40) || 'Empty note'}
                  </p>
                  <p
                    className="text-[10px] mt-1"
                    style={{ color: 'var(--text-faint)' }}
                  >
                    {formatDate(note.updatedAt)}
                  </p>
                </div>
              </div>
              <button
                onClick={(e) => { deleteNote(note.id, e) }}
                className="opacity-0 group-hover:opacity-100 shrink-0 mt-0.5 transition-all"
                style={{ color: 'var(--text-muted)' }}
              >
                <Trash2 size={13} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {selected ? (
          <>
            {/* Title + Save */}
            {/* Title + Actions */}
<div
  className="flex items-center gap-3 px-6 py-4 border-b shrink-0"
  style={{ borderColor: 'var(--surface-border)' }}
>
  <input
    type="text"
    value={title}
    onChange={(e) => { setTitle(e.target.value) }}
    onKeyDown={(e) => { if (e.key === 'Enter') editorRef.current?.focus() }}
    placeholder="Note title..."
    className="flex-1 bg-transparent outline-none font-display font-bold text-xl"
    style={{ color: 'var(--text-primary)' }}
  />

  {/* Export dropdown */}
  <div className="flex items-center gap-2">
    <button
      onClick={exportAsText}
      className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs border transition-all"
      style={{
        borderColor: 'var(--surface-border)',
        background: 'var(--bg-tertiary)',
        color: 'var(--text-muted)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'var(--accent-primary)'
        e.currentTarget.style.color = 'var(--accent-primary)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'var(--surface-border)'
        e.currentTarget.style.color = 'var(--text-muted)'
      }}
      title="Export as .txt"
    >
      <Download size={13} />
      TXT
    </button>

    <button
      onClick={exportAsPDF}
      className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs border transition-all"
      style={{
        borderColor: 'var(--surface-border)',
        background: 'var(--bg-tertiary)',
        color: 'var(--text-muted)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = '#ef4444'
        e.currentTarget.style.color = '#ef4444'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'var(--surface-border)'
        e.currentTarget.style.color = 'var(--text-muted)'
      }}
      title="Export as PDF"
    >
      <Download size={13} />
      PDF
    </button>

    <button
      onClick={saveNote}
      className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white transition-all glow-sm"
      style={{ background: saved ? '#22c55e' : 'var(--gradient)' }}
    >
      <Save size={14} />
      {saved ? 'Saved!' : 'Save'}
    </button>
  </div>
</div>

            {/* Formatting Toolbar */}
            <div
              className="flex items-center gap-1 px-4 py-2 border-b shrink-0 flex-wrap"
              style={{ borderColor: 'var(--surface-border)', background: 'var(--bg-secondary)' }}
            >
              {toolbarButtons.map((btn, i) => (
                <button
                  key={i}
                  onClick={btn.action}
                  title={btn.title}
                  className="w-8 h-8 flex items-center justify-center rounded-lg transition-all duration-150"
                  style={{ color: 'var(--text-muted)' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'var(--accent-glow)'
                    e.currentTarget.style.color = 'var(--accent-primary)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent'
                    e.currentTarget.style.color = 'var(--text-muted)'
                  }}
                >
                  <btn.icon size={15} />
                </button>
              ))}

              {/* Color picker */}
              <div className="w-px h-5 mx-1" style={{ background: 'var(--surface-border)' }} />
              {['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#a855f7'].map(color => (
                <button
                  key={color}
                  onClick={() => { exec('foreColor', color) }}
                  title={`Color: ${color}`}
                  className="w-5 h-5 rounded-full border-2 transition-all"
                  style={{
                    background: color,
                    borderColor: 'transparent',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--text-primary)' }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'transparent' }}
                />
              ))}
            </div>

            {/* Editable content */}
            <div className="flex-1 overflow-y-auto px-8 py-6">
              <div
                ref={editorRef}
                contentEditable
                suppressContentEditableWarning
                onKeyDown={(e) => {
                  if (e.key === 's' && (e.ctrlKey || e.metaKey)) {
                    e.preventDefault()
                    saveNote()
                  }
                }}
                className="outline-none min-h-full text-sm leading-relaxed notes-editor"
                style={{ color: 'var(--text-primary)' }}
                data-placeholder="Start writing your note..."
              />
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full gap-4">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center"
              style={{ background: 'var(--accent-glow)' }}
            >
              <FileText size={28} style={{ color: 'var(--accent-primary)' }} />
            </div>
            <div className="text-center">
              <p
                className="text-sm font-medium"
                style={{ color: 'var(--text-primary)' }}
              >
                Select a note to edit
              </p>
              <p
                className="text-xs mt-1"
                style={{ color: 'var(--text-muted)' }}
              >
                Or create a new one with the + button
              </p>
            </div>
            <button
              onClick={createNote}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-white glow-sm"
              style={{ background: 'var(--gradient)' }}
            >
              <Plus size={15} /> New Note
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default NotesPage