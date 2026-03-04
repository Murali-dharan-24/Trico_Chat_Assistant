import { useState } from 'react'
import { Search, ExternalLink, RefreshCw, X } from 'lucide-react'
import { NewsCardSkeleton, ListSkeleton } from '../components/ui/Skeleton'

function WebLookupPage() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [searched, setSearched] = useState(false)
  const [summary, setSummary] = useState('')
  const [summarizing, setSummarizing] = useState(false)

  const GROQ_KEY = import.meta.env.VITE_GROQ_API_KEY
  const NEWS_KEY = import.meta.env.VITE_NEWS_API_KEY

  const search = async () => {
    if (!query.trim()) return
    setLoading(true)
    setError(null)
    setResults([])
    setSummary('')
    setSearched(true)
    try {
      const res = await fetch(
        `https://newsdata.io/api/1/news?apikey=${NEWS_KEY}&q=${encodeURIComponent(query)}&language=en&size=8`
      )
      if (!res.ok) throw new Error('Search failed')
      const data = await res.json()
      setResults(data.results || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const summarizeResults = async () => {
    if (results.length === 0) return
    setSummarizing(true)
    setSummary('')
    try {
      const content = results
        .slice(0, 5)
        .map(r => `Title: ${r.title}\nDescription: ${r.description || ''}`)
        .join('\n\n')

      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${GROQ_KEY}`,
        },
        body: JSON.stringify({
          model: 'llama-3.1-8b-instant',
          messages: [
            {
              role: 'system',
              content: 'You are Trico. Summarize the following news results into a clear, concise overview in 3-5 sentences.',
            },
            {
              role: 'user',
              content: `Summarize these results for "${query}":\n\n${content}`,
            },
          ],
          max_tokens: 300,
        }),
      })
      const data = await res.json()
      setSummary(data?.choices?.[0]?.message?.content || '')
    } catch (err) {
      setSummary('Could not generate summary.')
    } finally {
      setSummarizing(false)
    }
  }

  const handleKey = (e) => {
    if (e.key === 'Enter') search()
  }

  const clearSearch = () => {
    setQuery('')
    setResults([])
    setSummary('')
    setSearched(false)
    setError(null)
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return ''
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric'
    })
  }

  const handleResultMouseEnter = (e) => {
    e.currentTarget.style.borderColor = 'var(--accent-primary)'
  }

  const handleResultMouseLeave = (e) => {
    e.currentTarget.style.borderColor = 'var(--surface-border)'
  }

  const handleChipMouseEnter = (e) => {
    e.currentTarget.style.borderColor = 'var(--accent-primary)'
    e.currentTarget.style.color = 'var(--accent-primary)'
  }

  const handleChipMouseLeave = (e) => {
    e.currentTarget.style.borderColor = 'var(--surface-border)'
    e.currentTarget.style.color = 'var(--text-muted)'
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto px-8 py-8">
      <div className="max-w-3xl mx-auto w-full flex flex-col gap-6">

        {/* Header */}
        <div>
          <h1 className="font-display font-bold text-2xl text-gradient">Web Lookup</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            Search the web and get AI summaries
          </p>
        </div>

        {/* Search bar */}
        <div
          className="flex items-center gap-3 px-4 py-3 rounded-2xl border"
          style={{ background: 'var(--bg-secondary)', borderColor: 'var(--surface-border)' }}
        >
          <Search size={18} style={{ color: 'var(--text-muted)' }} />
          <input
            type="text"
            value={query}
            onChange={(e) => { setQuery(e.target.value) }}
            onKeyDown={handleKey}
            placeholder="Search anything..."
            className="flex-1 bg-transparent outline-none text-sm"
            style={{ color: 'var(--text-primary)' }}
          />
          {query && (
            <button onClick={clearSearch} style={{ color: 'var(--text-muted)' }}>
              <X size={16} />
            </button>
          )}
          <button
            onClick={search}
            disabled={!query.trim() || loading}
            className="px-4 py-2 rounded-xl text-sm font-medium text-white transition-all disabled:opacity-40"
            style={{ background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))' }}
          >
            {loading && <ListSkeleton count={5} Component={NewsCardSkeleton} />}
          </button>
        </div>

        {/* Error */}
        {error && (
          <p className="text-sm text-red-400 px-1">{error}</p>
        )}

        {/* No results */}
        {searched && !loading && results.length === 0 && !error && (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <span className="text-4xl">🔍</span>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              No results found for "{query}"
            </p>
          </div>
        )}

        {/* AI Summary */}
        {results.length > 0 && (
          <div
            className="rounded-2xl p-5 border"
            style={{ background: 'var(--bg-secondary)', borderColor: 'var(--surface-border)' }}
          >
            <div className="flex items-center justify-between mb-3">
              <span
                className="text-xs px-2 py-0.5 rounded-full font-medium"
                style={{ background: 'var(--accent-glow)', color: 'var(--accent-primary)' }}
              >
                ⚡ Trico Summary
              </span>
              {!summary && (
                <button
                  onClick={summarizeResults}
                  disabled={summarizing}
                  className="text-xs px-3 py-1.5 rounded-lg font-medium transition-all disabled:opacity-40"
                  style={{ background: 'var(--accent-glow)', color: 'var(--accent-primary)' }}
                >
                  {summarizing ? 'Summarizing...' : 'Summarize Results'}
                </button>
              )}
            </div>
            {summarizing && (
              <div className="flex items-center gap-2 py-2">
                <RefreshCw size={13} className="animate-spin" style={{ color: 'var(--accent-primary)' }} />
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Generating summary...</p>
              </div>
            )}
            {summary && (
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-primary)' }}>
                {summary}
              </p>
            )}
            {!summary && !summarizing && (
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                Click "Summarize Results" to get an AI overview.
              </p>
            )}
          </div>
        )}

        {/* Results */}
        {results.length > 0 && (
          <div className="flex flex-col gap-3">
            <p className="text-xs px-1" style={{ color: 'var(--text-muted)' }}>
              {results.length} results for "{query}"
            </p>
            {results.map((article, i) => (
              <a
                key={i}
                href={article.link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col gap-2 p-4 rounded-2xl border transition-all duration-200 group"
                style={{ background: 'var(--bg-secondary)', borderColor: 'var(--surface-border)' }}
                onMouseEnter={handleResultMouseEnter}
                onMouseLeave={handleResultMouseLeave}
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm font-medium leading-snug" style={{ color: 'var(--text-primary)' }}>
                    {article.title}
                  </p>
                  <ExternalLink
                    size={14}
                    className="shrink-0 mt-0.5 opacity-0 group-hover:opacity-100 transition-all"
                    style={{ color: 'var(--accent-primary)' }}
                  />
                </div>
                {article.description && (
                  <p className="text-xs leading-relaxed line-clamp-2" style={{ color: 'var(--text-muted)' }}>
                    {article.description}
                  </p>
                )}
                <div className="flex items-center gap-3">
                  <span
                    className="text-[11px] px-2 py-0.5 rounded-full"
                    style={{ background: 'var(--bg-tertiary)', color: 'var(--text-muted)' }}
                  >
                    {article.source_id}
                  </span>
                  {article.pubDate && (
                    <span className="text-[11px]" style={{ color: 'var(--text-faint)' }}>
                      {formatDate(article.pubDate)}
                    </span>
                  )}
                </div>
              </a>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!searched && (
          <div className="flex flex-col items-center justify-center py-16 gap-4">
            <span className="text-5xl">🌐</span>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              Search for any topic to find latest news and information
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {['AI news', 'Space exploration', 'Tech trends', 'Climate change'].map(s => (
                <button
                  key={s}
                  onClick={() => { setQuery(s) }}
                  className="px-3 py-1.5 rounded-full text-xs border transition-all"
                  style={{ borderColor: 'var(--surface-border)', background: 'var(--bg-secondary)', color: 'var(--text-muted)' }}
                  onMouseEnter={handleChipMouseEnter}
                  onMouseLeave={handleChipMouseLeave}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  )
}

export default WebLookupPage