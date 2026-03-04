import { useState, useRef } from 'react'
import { sendMessage } from '../lib/api'
import { extractMemories } from '../lib/memory'

const generateTitle = (text) => {
  return text.length > 50 ? text.substring(0, 50) + '...' : text
}

const getChatId = () => {
  return Date.now().toString()
}

export function useChat(onPageChange) {
  const [messages, setMessages] = useState([])
  const [isThinking, setIsThinking] = useState(false)
  const [error, setError] = useState(null)
  const [isExtracting, setIsExtracting] = useState(false)
  const chatIdRef = useRef(null)

  // Save entire chat to history
  const saveChatToHistory = (msgs, id, title) => {
    if (msgs.length === 0) return
    const history = JSON.parse(localStorage.getItem('trico-history') || '[]')
    const existingIndex = history.findIndex(h => h.id === id)

    if (existingIndex !== -1) {
      // Update existing chat
      history[existingIndex].messages = msgs
      history[existingIndex].updatedAt = new Date().toISOString()
    } else {
      // Create new chat entry
      history.unshift({
        id,
        title,
        messages: msgs,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
    }

    // Keep max 50 chats
    const trimmed = history.slice(0, 50)
    localStorage.setItem('trico-history', JSON.stringify(trimmed))
  }

  const send = async (text) => {
    if (!text.trim() || isThinking) return
    setError(null)

    // Generate chat ID on first message
    if (!chatIdRef.current) {
      chatIdRef.current = getChatId()
    }

    const userMessage = { role: 'user', content: text, timestamp: new Date().toISOString() }
    const updatedMessages = [...messages, userMessage]
    setMessages(updatedMessages)
    setIsThinking(true)

    try {
      const reply = await sendMessage(updatedMessages)
      const assistantMessage = { role: 'assistant', content: reply, timestamp: new Date().toISOString() }
      const finalMessages = [...updatedMessages, assistantMessage]
      setMessages(finalMessages)

      // Save whole chat — title from first user message
      const title = generateTitle(finalMessages[0].content)
      saveChatToHistory(finalMessages, chatIdRef.current, title)

      // Extract memories in background
      setIsExtracting(true)
      extractMemories(text, reply).finally(() => {
        setIsExtracting(false)
      })

    } catch (err) {
      setError(err.message)
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `Sorry, something went wrong — ${err.message}. Please try again.`,
        },
      ])
    } finally {
      setIsThinking(false)
    }
  }

  // Load a chat from history and continue it
  const loadChat = (chat) => {
    chatIdRef.current = chat.id
    setMessages(chat.messages)
    setError(null)
    if (onPageChange) onPageChange('chat')
  }

  const clear = () => {
    setMessages([])
    setError(null)
    chatIdRef.current = null
  }

  const pinMessage = (message) => {
    const pinned = JSON.parse(localStorage.getItem('trico-pinned') || '[]')
    const already = pinned.find(
      p => p.content === message.content && p.role === message.role
    )
    if (already) return
    const updated = [
      { ...message, pinnedAt: new Date().toISOString() },
      ...pinned,
    ]
    localStorage.setItem('trico-pinned', JSON.stringify(updated))
  }

  const regenerate = async () => {
  if (messages.length < 2 || isThinking) return

  // Remove last assistant message
  const withoutLast = messages.slice(0, -1)
  setMessages(withoutLast)
  setIsThinking(true)
  setError(null)

  try {
    const reply = await sendMessage(withoutLast)
    const assistantMessage = {
      role: 'assistant',
      content: reply,
      timestamp: new Date().toISOString(),
    }
    const finalMessages = [...withoutLast, assistantMessage]
    setMessages(finalMessages)

    const title = generateTitle(finalMessages[0].content)
    saveChatToHistory(finalMessages, chatIdRef.current, title)

    setIsExtracting(true)
    const lastUser = withoutLast[withoutLast.length - 1]
    extractMemories(lastUser.content, reply).finally(() => {
      setIsExtracting(false)
    })
  } catch (err) {
    setError(err.message)
    setMessages((prev) => [
      ...prev,
      {
        role: 'assistant',
        content: `Sorry, something went wrong — ${err.message}. Please try again.`,
        timestamp: new Date().toISOString(),
      },
    ])
  } finally {
    setIsThinking(false)
  }
}

const editMessage = async (index, newText) => {
  if (isThinking) return

  // Slice messages up to and including the edited message
  const updatedMessages = [
    ...messages.slice(0, index),
    {
      role: 'user',
      content: newText,
      timestamp: new Date().toISOString(),
    },
  ]

  setMessages(updatedMessages)
  setIsThinking(true)
  setError(null)

  try {
    const reply = await sendMessage(updatedMessages)
    const assistantMessage = {
      role: 'assistant',
      content: reply,
      timestamp: new Date().toISOString(),
    }
    const finalMessages = [...updatedMessages, assistantMessage]
    setMessages(finalMessages)

    const title = generateTitle(finalMessages[0].content)
    saveChatToHistory(finalMessages, chatIdRef.current, title)

    setIsExtracting(true)
    extractMemories(newText, reply).finally(() => {
      setIsExtracting(false)
    })
  } catch (err) {
    setError(err.message)
    setMessages((prev) => [
      ...prev,
      {
        role: 'assistant',
        content: `Sorry, something went wrong — ${err.message}. Please try again.`,
        timestamp: new Date().toISOString(),
      },
    ])
  } finally {
    setIsThinking(false)
  }
}

const summarize = async () => {
  if (messages.length < 4) return null

  const GROQ_KEY = import.meta.env.VITE_GROQ_API_KEY

  const conversation = messages
    .map(m => `${m.role === 'user' ? 'User' : 'Trico'}: ${m.content}`)
    .join('\n')

  try {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_KEY}`,
      },
      body: JSON.stringify({
        model: localStorage.getItem('trico-model') || 'llama-3.1-8b-instant',
        messages: [
          {
            role: 'user',
            content: `Summarize this conversation in 3-5 bullet points. Be concise and capture the key topics, decisions, and outcomes. Format each bullet with a relevant emoji.\n\nConversation:\n${conversation}`,
          },
        ],
        max_tokens: 300,
      }),
    })
    const data = await res.json()
    return data?.choices?.[0]?.message?.content || null
  } catch {
    return null
  }
}

  return {
    messages,
    isThinking,
    isExtracting,
    error,
    send,
    clear,
    loadChat,
    pinMessage,
    regenerate,
    editMessage,
    summarize,
  }
}