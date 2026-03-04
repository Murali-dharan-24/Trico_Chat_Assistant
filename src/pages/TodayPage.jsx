import { useState, useEffect } from 'react'
import { Cloud, Wind, Droplets, Plus, Check, Trash2, RefreshCw, MapPin } from 'lucide-react'
import { WeatherSkeleton, NewsCardSkeleton, ListSkeleton } from '../components/ui/Skeleton'

function TodayPage() {
  const username = localStorage.getItem('trico-username') || 'there'

  const [weather, setWeather] = useState(null)
  const [forecast, setForecast] = useState([])
  const [news, setNews] = useState([])
  const [tasks, setTasks] = useState(() =>
    JSON.parse(localStorage.getItem('trico-tasks') || '[]')
  )
  const [newTask, setNewTask] = useState('')
  const [weatherLoading, setWeatherLoading] = useState(true)
  const [forecastLoading, setForecastLoading] = useState(true)
  const [newsLoading, setNewsLoading] = useState(true)
  const [weatherError, setWeatherError] = useState(null)
  const [newsError, setNewsError] = useState(null)
  const [locationName, setLocationName] = useState('')
  const [coords, setCoords] = useState(null)

  const weatherKey = import.meta.env.VITE_WEATHER_API_KEY
  const newsKey = import.meta.env.VITE_NEWS_API_KEY

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCoords({
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          })
        },
        () => {
          const savedCity = localStorage.getItem('trico-city') || 'London'
          fetchWeatherByCity(savedCity)
        }
      )
    } else {
      const savedCity = localStorage.getItem('trico-city') || 'London'
      fetchWeatherByCity(savedCity)
    }
    fetchNews()
  }, [])

  useEffect(() => {
    if (coords) {
      fetchWeatherByCoords(coords.lat, coords.lon)
      fetchForecastByCoords(coords.lat, coords.lon)
    }
  }, [coords])

  const fetchWeatherByCoords = async (lat, lon) => {
    setWeatherLoading(true)
    setWeatherError(null)
    try {
      const res = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${weatherKey}&units=metric`
      )
      if (!res.ok) throw new Error('Failed to fetch weather')
      const data = await res.json()
      setWeather(data)
      setLocationName(`${data.name}, ${data.sys.country}`)
      localStorage.setItem('trico-city', data.name)
    } catch (err) {
      setWeatherError(err.message)
    } finally {
      setWeatherLoading(false)
    }
  }

  const fetchForecastByCoords = async (lat, lon) => {
    setForecastLoading(true)
    try {
      const res = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${weatherKey}&units=metric&cnt=56`
      )
      if (!res.ok) throw new Error('Failed to fetch forecast')
      const data = await res.json()

      // Group by day — pick midday reading for each day
      const days = {}
      data.list.forEach(item => {
        const date = new Date(item.dt * 1000)
        const dayKey = date.toDateString()
        const hour = date.getHours()
        if (!days[dayKey] || Math.abs(hour - 12) < Math.abs(new Date(days[dayKey].dt * 1000).getHours() - 12)) {
          days[dayKey] = item
        }
      })

      const todayKey = new Date().toDateString()
      const forecastDays = Object.entries(days)
        .filter(([key]) => key !== todayKey)
        .slice(0, 7)
        .map(([, item]) => item)

      setForecast(forecastDays)
    } catch (err) {
      console.warn('Forecast error:', err)
    } finally {
      setForecastLoading(false)
    }
  }

  const fetchWeatherByCity = async (city) => {
    setWeatherLoading(true)
    setWeatherError(null)
    try {
      const res = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${weatherKey}&units=metric`
      )
      if (!res.ok) throw new Error('City not found')
      const data = await res.json()
      setWeather(data)
      setLocationName(`${data.name}, ${data.sys.country}`)

      // Also fetch forecast by city
      const fRes = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${weatherKey}&units=metric&cnt=56`
      )
      if (fRes.ok) {
        const fData = await fRes.json()
        const days = {}
        fData.list.forEach(item => {
          const date = new Date(item.dt * 1000)
          const dayKey = date.toDateString()
          const hour = date.getHours()
          if (!days[dayKey] || Math.abs(hour - 12) < Math.abs(new Date(days[dayKey].dt * 1000).getHours() - 12)) {
            days[dayKey] = item
          }
        })
        const todayKey = new Date().toDateString()
        const forecastDays = Object.entries(days)
          .filter(([key]) => key !== todayKey)
          .slice(0, 7)
          .map(([, item]) => item)
        setForecast(forecastDays)
      }
    } catch (err) {
      setWeatherError(err.message)
    } finally {
      setWeatherLoading(false)
      setForecastLoading(false)
    }
  }

  const getProductivityScore = () => {
  if (tasks.length === 0) return null
  const done = tasks.filter(t => t.done).length
  const score = Math.round((done / tasks.length) * 100)
  return { score, done, total: tasks.length }
}

const getScoreInfo = (score) => {
  if (score === 100) return { label: 'Perfect!', emoji: '🏆', color: '#22c55e' }
  if (score >= 75) return { label: 'Great work', emoji: '🔥', color: '#3b82f6' }
  if (score >= 50) return { label: 'Halfway there', emoji: '💪', color: '#f59e0b' }
  if (score >= 25) return { label: 'Getting started', emoji: '🌱', color: '#8b5cf6' }
  return { label: 'Just starting', emoji: '⚡', color: 'var(--accent-primary)' }
}


  const fetchNews = async () => {
  setNewsLoading(true)
  setNewsError(null)
  try {
    // Load user interests from localStorage
    const savedInterests = localStorage.getItem('trico-interests')
    const interests = savedInterests
      ? JSON.parse(savedInterests)
      : ['technology', 'science']

    const categories = interests.length > 0
      ? interests.join(',')
      : 'technology,science'

    const res = await fetch(
      `https://newsdata.io/api/1/news?apikey=${newsKey}&language=en&category=${categories}&size=6`
    )
    if (!res.ok) throw new Error('Failed to fetch news')
    const data = await res.json()
    setNews(data.results || [])
  } catch (err) {
    setNewsError(err.message)
  } finally {
    setNewsLoading(false)
  }
}

  const refreshWeather = () => {
    if (coords) {
      fetchWeatherByCoords(coords.lat, coords.lon)
      fetchForecastByCoords(coords.lat, coords.lon)
    } else {
      const savedCity = localStorage.getItem('trico-city') || 'London'
      fetchWeatherByCity(savedCity)
    }
  }

  const addTask = () => {
    if (!newTask.trim()) return
    const updated = [...tasks, { id: Date.now(), text: newTask.trim(), done: false }]
    setTasks(updated)
    localStorage.setItem('trico-tasks', JSON.stringify(updated))
    setNewTask('')
  }

  const toggleTask = (id) => {
    const updated = tasks.map(t => t.id === id ? { ...t, done: !t.done } : t)
    setTasks(updated)
    localStorage.setItem('trico-tasks', JSON.stringify(updated))
  }

  const deleteTask = (id) => {
    const updated = tasks.filter(t => t.id !== id)
    setTasks(updated)
    localStorage.setItem('trico-tasks', JSON.stringify(updated))
  }

  const getGreeting = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 17) return 'Good afternoon'
    return 'Good evening'
  }

  const getWeatherEmoji = (condition) => {
    const c = condition?.toLowerCase() || ''
    if (c.includes('clear')) return '☀️'
    if (c.includes('cloud')) return '☁️'
    if (c.includes('rain')) return '🌧️'
    if (c.includes('storm')) return '⛈️'
    if (c.includes('snow')) return '❄️'
    if (c.includes('mist') || c.includes('fog')) return '🌫️'
    return '🌤️'
  }

  const getDayName = (dt) => {
    return new Date(dt * 1000).toLocaleDateString('en-US', { weekday: 'short' })
  }

  const getDate = (dt) => {
    return new Date(dt * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const handleNewsMouseEnter = (e) => {
    e.currentTarget.style.borderColor = 'var(--accent-primary)'
  }

  const handleNewsMouseLeave = (e) => {
    e.currentTarget.style.borderColor = 'var(--surface-border)'
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto px-4 md:px-8 py-8">
      <div className="max-w-3xl mx-auto w-full flex flex-col gap-6">

        {/* Greeting */}
        <div>
          <h1 className="font-display font-bold text-2xl text-gradient">
            {getGreeting()}, {username}!
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long', month: 'long', day: 'numeric',
            })}
          </p>
        </div>

{/* Productivity Score */}
{(() => {
  const productivity = getProductivityScore()
  if (!productivity) return null
  const info = getScoreInfo(productivity.score)
  const circumference = 2 * Math.PI * 28

  return (
    <div
      className="rounded-2xl p-5 border flex items-center gap-5"
      style={{ background: 'var(--bg-secondary)', borderColor: 'var(--surface-border)' }}
    >
      {/* Circular progress */}
      <div className="relative shrink-0 w-20 h-20 flex items-center justify-center">
        <svg width="80" height="80" className="absolute" style={{ transform: 'rotate(-90deg)' }}>
          {/* Background ring */}
          <circle
            cx="40"
            cy="40"
            r="28"
            fill="none"
            stroke="var(--surface)"
            strokeWidth="6"
          />
          {/* Progress ring */}
          <circle
            cx="40"
            cy="40"
            r="28"
            fill="none"
            stroke={info.color}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference - (productivity.score / 100) * circumference}
            style={{ transition: 'stroke-dashoffset 0.8s ease' }}
          />
        </svg>
        <div className="relative flex flex-col items-center">
          <span
            className="text-lg font-bold font-display leading-none"
            style={{ color: info.color }}
          >
            {productivity.score}%
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xl">{info.emoji}</span>
          <h3
            className="font-display font-bold text-base"
            style={{ color: 'var(--text-primary)' }}
          >
            {info.label}
          </h3>
        </div>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          {productivity.done} of {productivity.total} tasks completed today
        </p>

        {/* Progress bar */}
        <div
          className="mt-3 h-2 rounded-full overflow-hidden"
          style={{ background: 'var(--surface)' }}
        >
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${productivity.score}%`,
              background: `linear-gradient(90deg, ${info.color}, var(--accent-secondary))`,
            }}
          />
        </div>
      </div>

      {/* Remaining badge */}
      {productivity.score < 100 && (
        <div
          className="shrink-0 flex flex-col items-center px-4 py-3 rounded-xl border"
          style={{ background: 'var(--bg-tertiary)', borderColor: 'var(--surface-border)' }}
        >
          <span
            className="text-xl font-bold font-display"
            style={{ color: 'var(--text-primary)' }}
          >
            {productivity.total - productivity.done}
          </span>
          <span className="text-[11px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
            remaining
          </span>
        </div>
      )}

      {/* All done state */}
      {productivity.score === 100 && (
        <div
          className="shrink-0 flex flex-col items-center px-4 py-3 rounded-xl border"
          style={{
            background: 'rgba(34,197,94,0.1)',
            borderColor: 'rgba(34,197,94,0.3)',
          }}
        >
          <span className="text-xl">✅</span>
          <span className="text-[11px] mt-0.5" style={{ color: '#22c55e' }}>
            All done!
          </span>
        </div>
      )}
    </div>
  )
})()}

        {/* Current Weather */}
        <div
          className="rounded-2xl p-6 border"
          style={{ background: 'var(--bg-secondary)', borderColor: 'var(--surface-border)' }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h2
                className="font-display font-semibold text-base"
                style={{ color: 'var(--text-primary)' }}
              >
                Weather
              </h2>
              {locationName && (
                <div
                  className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full"
                  style={{ background: 'var(--accent-glow)', color: 'var(--accent-primary)' }}
                >
                  <MapPin size={10} />
                  {locationName}
                </div>
              )}
            </div>
            <button onClick={refreshWeather} style={{ color: 'var(--text-muted)' }}>
              <RefreshCw size={14} className={weatherLoading ? 'animate-spin' : ''} />
            </button>
          </div>

          {weatherLoading && <WeatherSkeleton />}
          {weatherError && (
            <p className="text-sm text-red-400">{weatherError} — Set your city in Settings</p>
          )}

          {weather && !weatherLoading && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-6xl">
                  {getWeatherEmoji(weather.weather?.[0]?.main)}
                </span>
                <div>
                  <p
                    className="text-5xl font-bold font-display"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {Math.round(weather.main.temp)}°C
                  </p>
                  <p
                    className="text-sm capitalize mt-1"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    {weather.weather?.[0]?.description}
                  </p>
                </div>
              </div>
              <div
                className="flex flex-col gap-3 p-4 rounded-xl border text-sm"
                style={{ background: 'var(--bg-tertiary)', borderColor: 'var(--surface-border)' }}
              >
                <div className="flex items-center gap-2">
                  <Droplets size={14} style={{ color: 'var(--accent-primary)' }} />
                  <span style={{ color: 'var(--text-muted)' }}>Humidity</span>
                  <span className="font-medium ml-auto" style={{ color: 'var(--text-primary)' }}>
                    {weather.main.humidity}%
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Wind size={14} style={{ color: 'var(--accent-primary)' }} />
                  <span style={{ color: 'var(--text-muted)' }}>Wind</span>
                  <span className="font-medium ml-auto" style={{ color: 'var(--text-primary)' }}>
                    {Math.round(weather.wind.speed)} m/s
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Cloud size={14} style={{ color: 'var(--accent-primary)' }} />
                  <span style={{ color: 'var(--text-muted)' }}>Feels like</span>
                  <span className="font-medium ml-auto" style={{ color: 'var(--text-primary)' }}>
                    {Math.round(weather.main.feels_like)}°C
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 7-Day Forecast */}
        {(forecastLoading || forecast.length > 0) && (
          <div
            className="rounded-2xl p-6 border"
            style={{ background: 'var(--bg-secondary)', borderColor: 'var(--surface-border)' }}
          >
            <h2
              className="font-display font-semibold text-base mb-4"
              style={{ color: 'var(--text-primary)' }}
            >
              7-Day Forecast
            </h2>

            {forecastLoading ? (
              <div className="grid grid-cols-7 gap-2">
                {[...Array(7)].map((_, i) => (
                  <div
                    key={i}
                    className="flex flex-col items-center gap-2 p-3 rounded-xl border"
                    style={{ background: 'var(--bg-tertiary)', borderColor: 'var(--surface-border)' }}
                  >
                    <div
                      className="h-3 w-8 rounded animate-pulse"
                      style={{ background: 'var(--surface)' }}
                    />
                    <div
                      className="h-6 w-6 rounded-full animate-pulse"
                      style={{ background: 'var(--surface)' }}
                    />
                    <div
                      className="h-3 w-10 rounded animate-pulse"
                      style={{ background: 'var(--surface)' }}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${forecast.length}, 1fr)` }}>
                {forecast.map((day, i) => (
                  <div
                    key={i}
                    className="flex flex-col items-center gap-2 p-3 rounded-xl border transition-all duration-200"
                    style={{
                      background: 'var(--bg-tertiary)',
                      borderColor: 'var(--surface-border)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = 'var(--accent-primary)'
                      e.currentTarget.style.background = 'var(--accent-glow)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'var(--surface-border)'
                      e.currentTarget.style.background = 'var(--bg-tertiary)'
                    }}
                  >
                    <p
                      className="text-[11px] font-semibold"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      {getDayName(day.dt)}
                    </p>
                    <p
                      className="text-[10px]"
                      style={{ color: 'var(--text-faint)' }}
                    >
                      {getDate(day.dt)}
                    </p>
                    <span className="text-2xl">
                      {getWeatherEmoji(day.weather?.[0]?.main)}
                    </span>
                    <div className="text-center">
                      <p
                        className="text-sm font-bold"
                        style={{ color: 'var(--text-primary)' }}
                      >
                        {Math.round(day.main.temp_max)}°
                      </p>
                      <p
                        className="text-[11px]"
                        style={{ color: 'var(--text-muted)' }}
                      >
                        {Math.round(day.main.temp_min)}°
                      </p>
                    </div>
                    <p
                      className="text-[10px] text-center capitalize leading-tight"
                      style={{ color: 'var(--text-faint)' }}
                    >
                      {day.weather?.[0]?.description}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tasks */}
        <div
          className="rounded-2xl p-6 border"
          style={{ background: 'var(--bg-secondary)', borderColor: 'var(--surface-border)' }}
        >
          <h2
            className="font-display font-semibold text-base mb-4"
            style={{ color: 'var(--text-primary)' }}
          >
            Tasks
          </h2>
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={newTask}
              onChange={(e) => { setNewTask(e.target.value) }}
              onKeyDown={(e) => { if (e.key === 'Enter') addTask() }}
              placeholder="Add a task..."
              className="flex-1 px-4 py-2.5 rounded-xl text-sm outline-none border"
              style={{
                background: 'var(--bg-tertiary)',
                borderColor: 'var(--surface-border)',
                color: 'var(--text-primary)',
              }}
            />
            <button
              onClick={addTask}
              className="px-4 py-2 rounded-xl text-sm font-medium text-white flex items-center gap-1.5 glow-sm"
              style={{ background: 'var(--gradient)' }}
            >
              <Plus size={15} /> Add
            </button>
          </div>

          {tasks.length === 0 ? (
            <p className="text-sm text-center py-4" style={{ color: 'var(--text-muted)' }}>
              No tasks yet — add one above!
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              {tasks.map(task => (
                <div
                  key={task.id}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl border"
                  style={{
                    background: 'var(--bg-tertiary)',
                    borderColor: 'var(--surface-border)',
                  }}
                >
                  <button
                    onClick={() => { toggleTask(task.id) }}
                    className="w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all"
                    style={{
                      borderColor: task.done ? 'var(--accent-primary)' : 'var(--text-muted)',
                      background: task.done ? 'var(--accent-primary)' : 'transparent',
                    }}
                  >
                    {task.done && <Check size={11} className="text-white" />}
                  </button>
                  <span
                    className="flex-1 text-sm"
                    style={{
                      color: task.done ? 'var(--text-muted)' : 'var(--text-primary)',
                      textDecoration: task.done ? 'line-through' : 'none',
                    }}
                  >
                    {task.text}
                  </span>
                  <button
                    onClick={() => { deleteTask(task.id) }}
                    style={{ color: 'var(--text-muted)' }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>


        {/* News */}
        <div
          className="rounded-2xl p-6 border"
          style={{ background: 'var(--bg-secondary)', borderColor: 'var(--surface-border)' }}
        >
          <div className="flex items-center justify-between mb-4">
            <div>
  <h2
    className="font-display font-semibold text-base"
    style={{ color: 'var(--text-primary)' }}
  >
    Latest News
  </h2>
  {(() => {
    const saved = localStorage.getItem('trico-interests')
    const interests = saved ? JSON.parse(saved) : ['technology', 'science']
    return (
      <p className="text-xs mt-0.5 capitalize" style={{ color: 'var(--text-muted)' }}>
        {interests.slice(0, 3).join(', ')}
        {interests.length > 3 ? ` +${interests.length - 3} more` : ''}
      </p>
    )
  })()}
</div>
            <button onClick={fetchNews} style={{ color: 'var(--text-muted)' }}>
              <RefreshCw size={14} className={newsLoading ? 'animate-spin' : ''} />
            </button>
          </div>

          {newsLoading && <ListSkeleton count={4} Component={NewsCardSkeleton} />}
          {newsError && <p className="text-sm text-red-400">{newsError}</p>}

          {!newsLoading && news.length > 0 && (
            <div className="flex flex-col gap-3">
              {news.map((article, i) => (
                <a 
                  key={i}
                  href={article.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col gap-1.5 p-4 rounded-xl border transition-all duration-200"
                  style={{
                    background: 'var(--bg-tertiary)',
                    borderColor: 'var(--surface-border)',
                  }}
                  onMouseEnter={handleNewsMouseEnter}
                  onMouseLeave={handleNewsMouseLeave}
                >
                  <p
                    className="text-sm font-medium leading-snug"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {article.title}
                  </p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    {article.source_id} · {new Date(article.pubDate).toLocaleDateString()}
                  </p>
                </a>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>

  )
}


export default TodayPage