const MEMORY_KEY = 'trico-memories'
const MAX_MEMORIES = 50

// Load all memories
export function loadMemories() {
  try {
    return JSON.parse(localStorage.getItem(MEMORY_KEY) || '[]')
  } catch {
    return []
  }
}

// Save a new memory
export function saveMemory(fact) {
  const memories = loadMemories()

  // Avoid duplicates — check if very similar memory exists
  const duplicate = memories.find(m =>
    m.fact.toLowerCase().trim() === fact.toLowerCase().trim()
  )
  if (duplicate) return

  const memory = {
    id: Date.now(),
    fact: fact.trim(),
    createdAt: new Date().toISOString(),
  }

  // Keep newest memories, trim if over limit
  const updated = [memory, ...memories].slice(0, MAX_MEMORIES)
  localStorage.setItem(MEMORY_KEY, JSON.stringify(updated))
}

// Delete a memory by id
export function deleteMemory(id) {
  const memories = loadMemories()
  const updated = memories.filter(m => m.id !== id)
  localStorage.setItem(MEMORY_KEY, JSON.stringify(updated))
}

// Clear all memories
export function clearMemories() {
  localStorage.removeItem(MEMORY_KEY)
}

// Build memory context string to inject into system prompt
export function buildMemoryContext() {
  const memories = loadMemories()
  if (memories.length === 0) return ''

  const facts = memories.map(m => `- ${m.fact}`).join('\n')

  return `
Here is what you know about the user from previous conversations. 
Use this to personalize your responses naturally — don't repeat it back unless relevant:

${facts}
`
}

// Extract memories from a conversation using Groq
export async function extractMemories(userMessage, assistantReply) {
  const apiKey = import.meta.env.VITE_GROQ_API_KEY

  const prompt = `You are a memory extraction system for an AI assistant called Trico.

Analyze this conversation exchange and extract any important personal facts about the user worth remembering long-term.

User said: "${userMessage}"
Assistant replied: "${assistantReply}"

Extract facts like:
- Name, age, location, occupation
- Preferences, hobbies, interests
- Goals, habits, relationships
- Technical skills or expertise
- Things they dislike or want to avoid
- Any personal context they shared

Rules:
- Only extract clear, factual information about the USER (not general knowledge)
- Each fact must be specific and useful for future conversations
- If nothing worth remembering, return empty array
- Return ONLY a raw JSON array of strings, no explanation, no markdown, no backticks

Example output:
["User's name is Mural", "User is a software developer", "User lives in Chennai"]

If nothing to remember return exactly: []`

  try {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 200,
        temperature: 0.1,
      }),
    })

    const data = await res.json()
    const text = data?.choices?.[0]?.message?.content?.trim() || '[]'

    // Safely parse the JSON array
    const parsed = JSON.parse(text)
    if (Array.isArray(parsed)) {
      parsed.forEach(fact => {
        if (typeof fact === 'string' && fact.length > 0) {
          saveMemory(fact)
        }
      })
    }
  } catch (err) {
    // Silently fail — memory extraction should never break the chat
    console.warn('Memory extraction failed:', err)
  }
}