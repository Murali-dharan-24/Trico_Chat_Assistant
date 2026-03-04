import { buildMemoryContext } from './memory'

const PERSONALITIES = {
  balanced: {
    name: 'Balanced',
    prompt: 'You are helpful, clear, and friendly. Balance detail with brevity. Match the user\'s tone naturally.',
  },
  professional: {
    name: 'Professional',
    prompt: 'You are formal, precise, and thorough. Use structured responses. Avoid casual language. Prioritize accuracy and depth.',
  },
  casual: {
    name: 'Casual',
    prompt: 'You are relaxed, conversational, and fun. Use casual language, contractions, and a friendly tone. Keep things light.',
  },
  concise: {
    name: 'Concise',
    prompt: 'You are extremely brief and to the point. No fluff. Short sentences. Bullet points preferred. Never over-explain.',
  },
  creative: {
    name: 'Creative',
    prompt: 'You are imaginative, expressive, and think outside the box. Use vivid language, analogies, and explore unconventional angles.',
  },
}

const BASE_PROMPT = `You are Trico, a highly capable personal AI assistant with a futuristic edge.

You help with anything — research, writing, planning, explaining concepts, coding, brainstorming, and conversation.

Core rules:
- Never say "As an AI" — just be direct and helpful.
- If you don't know something, say so honestly.
- Use markdown naturally — bold for key terms, code blocks for code, lists when helpful.
- Use what you know about the user to personalize responses naturally.
- You have persistent memory — you remember things about the user across conversations.`

export function buildSystemPrompt() {
  const memoryContext = buildMemoryContext()
  const personalityKey = localStorage.getItem('trico-personality') || 'balanced'
  const personality = PERSONALITIES[personalityKey] || PERSONALITIES.balanced

  let prompt = `${BASE_PROMPT}

Personality & tone: ${personality.prompt}`

  if (memoryContext) {
    prompt += `\n\n${memoryContext}`
  }

  return prompt
}

export async function sendMessage(messages) {
  const apiKey = import.meta.env.VITE_GROQ_API_KEY
  const systemPrompt = buildSystemPrompt()

  const formattedMessages = [
    { role: 'system', content: systemPrompt },
    ...messages.map((msg) => ({
      role: msg.role === 'assistant' ? 'assistant' : 'user',
      content: msg.content,
    })),
  ]

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: localStorage.getItem('trico-model') || 'llama-3.1-8b-instant',
      messages: formattedMessages,
      max_tokens: 1500,
      temperature: 0.7,
    }),
  })

  if (!response.ok) {
    const err = await response.json()
    throw new Error(err?.error?.message || 'Something went wrong with Groq.')
  }

  const data = await response.json()
  const text = data?.choices?.[0]?.message?.content
  if (!text) throw new Error('No response from Groq.')
  return text
}