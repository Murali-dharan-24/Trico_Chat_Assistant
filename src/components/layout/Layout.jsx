import { useState, useCallback, useEffect } from 'react'
import { useChat } from '../../hooks/useChat'
import Header from './Header'
import Sidebar from './Sidebar'
import ChatWindow from '../chat/ChatWindow'
import SettingsPage from '../../pages/SettingsPage'
import TodayPage from '../../pages/TodayPage'
import NotesPage from '../../pages/NotesPage'
import RemindersPage from '../../pages/RemindersPage'
import HistoryPage from '../../pages/HistoryPage'
import PinnedPage from '../../pages/PinnedPage'
import WebLookupPage from '../../pages/WebLookupPage'
import MemoryPage from '../../pages/MemoryPage'
import PageTransition from '../ui/PageTransition'
import AnimatedBackground from '../ui/AnimatedBackground'

function Layout() {
  const [activePage, setActivePage] = useState('chat')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
      if (window.innerWidth >= 768) setSidebarOpen(false)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const {
    messages,
    isThinking,
    isExtracting,
    send,
    clear,
    loadChat,
    pinMessage,
    regenerate,
    editMessage,
    summarize,
  } = useChat(setActivePage)

  const handleLoadChat = useCallback((chat) => {
    clear()
    loadChat(chat)
  }, [])

  const handleNewChat = () => {
    clear()
    setActivePage('chat')
    setSidebarOpen(false)
  }

  const handlePageChange = (page) => {
    setActivePage(page)
    setSidebarOpen(false)
  }

  const renderPage = () => {
    switch (activePage) {
      case 'settings': return <SettingsPage />
      case 'today': return <TodayPage />
      case 'notes': return <NotesPage />
      case 'reminders': return <RemindersPage />
      case 'history': return <HistoryPage onLoadChat={handleLoadChat} />
      case 'pinned': return <PinnedPage />
      case 'weblookup': return <WebLookupPage />
      case 'memory': return <MemoryPage />
      default: return (
        <ChatWindow
          messages={messages}
          isThinking={isThinking}
          isExtracting={isExtracting}
          onSend={send}
          onPin={pinMessage}
          onRegenerate={regenerate}
          onEdit={editMessage}
          onSummarize={summarize}
        />
      )
    }
  }

  return (
  <div style={{
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    width: '100vw',
    overflow: 'hidden',
    background: 'var(--bg-primary)',
  }}>
    {/* Animated background */}
    <AnimatedBackground />

    {/* Everything else sits above it */}
    <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Header
        onMenuClick={() => { setSidebarOpen(!sidebarOpen) }}
        sidebarOpen={sidebarOpen}
        isMobile={isMobile}
      />

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden', position: 'relative' }}>

        {/* Mobile backdrop */}
        {isMobile && sidebarOpen && (
          <div
            onClick={() => { setSidebarOpen(false) }}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 20,
              background: 'rgba(0,0,0,0.6)',
              backdropFilter: 'blur(4px)',
            }}
          />
        )}

        {/* Single sidebar */}
        <div style={{
          position: isMobile ? 'fixed' : 'relative',
          zIndex: isMobile ? 30 : 'auto',
          top: isMobile ? '57px' : 'auto',
          left: 0,
          height: isMobile ? 'calc(100% - 57px)' : '100%',
          flexShrink: 0,
          transform: isMobile
            ? sidebarOpen ? 'translateX(0)' : 'translateX(-100%)'
            : 'translateX(0)',
          transition: 'transform 0.3s ease',
        }}>
          <Sidebar
            activePage={activePage}
            setActivePage={handlePageChange}
            onNewChat={handleNewChat}
          />
        </div>

        {/* Main content */}
        <main style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          minWidth: 0,
        }}>
          <PageTransition pageKey={activePage}>
            {renderPage()}
          </PageTransition>
        </main>

      </div>
    </div>
  </div>
)
}

export default Layout