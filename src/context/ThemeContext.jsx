import { createContext, useContext, useState, useEffect } from 'react'

export const themes = {
  midnight: {
    name: 'Midnight',
    emoji: '🌙',
    bg: { primary: '#070b14', secondary: '#0d1526', tertiary: '#111d35' },
    accent: { primary: '#3b82f6', secondary: '#60a5fa', glow: 'rgba(59,130,246,0.25)' },
    surface: { DEFAULT: '#111d35', hover: '#172340', border: 'rgba(59,130,246,0.12)' },
    text: { primary: '#e8f0ff', muted: '#5a7aaa', faint: '#1e3a5f' },
    gradient: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
  },
  aurora: {
    name: 'Aurora',
    emoji: '🌌',
    bg: { primary: '#08060f', secondary: '#100d1c', tertiary: '#171228' },
    accent: { primary: '#a855f7', secondary: '#ec4899', glow: 'rgba(168,85,247,0.25)' },
    surface: { DEFAULT: '#171228', hover: '#1e1735', border: 'rgba(168,85,247,0.12)' },
    text: { primary: '#f0e8ff', muted: '#7a5aaa', faint: '#2a1a4f' },
    gradient: 'linear-gradient(135deg, #a855f7, #ec4899)',
  },
  ocean: {
    name: 'Ocean',
    emoji: '🌊',
    bg: { primary: '#050e14', secondary: '#091520', tertiary: '#0d1e2c' },
    accent: { primary: '#06b6d4', secondary: '#22d3ee', glow: 'rgba(6,182,212,0.25)' },
    surface: { DEFAULT: '#0d1e2c', hover: '#122638', border: 'rgba(6,182,212,0.12)' },
    text: { primary: '#e0f8ff', muted: '#3a7a8a', faint: '#0a2a3a' },
    gradient: 'linear-gradient(135deg, #06b6d4, #3b82f6)',
  },
  forest: {
    name: 'Forest',
    emoji: '🌲',
    bg: { primary: '#060c08', secondary: '#0a1410', tertiary: '#0e1c14' },
    accent: { primary: '#22c55e', secondary: '#4ade80', glow: 'rgba(34,197,94,0.25)' },
    surface: { DEFAULT: '#0e1c14', hover: '#132418', border: 'rgba(34,197,94,0.12)' },
    text: { primary: '#e0ffe8', muted: '#3a7a4a', faint: '#0a2a14' },
    gradient: 'linear-gradient(135deg, #22c55e, #06b6d4)',
  },
  eclipse: {
    name: 'Eclipse',
    emoji: '🔥',
    bg: { primary: '#0f0805', secondary: '#1a100a', tertiary: '#221510' },
    accent: { primary: '#f97316', secondary: '#fb923c', glow: 'rgba(249,115,22,0.25)' },
    surface: { DEFAULT: '#221510', hover: '#2c1c14', border: 'rgba(249,115,22,0.12)' },
    text: { primary: '#fff0e8', muted: '#8a5a3a', faint: '#3a1a0a' },
    gradient: 'linear-gradient(135deg, #f97316, #ec4899)',
  },
  light: {
    name: 'Light',
    emoji: '☀️',
    bg: { primary: '#f0f4ff', secondary: '#e4ecff', tertiary: '#d8e4ff' },
    accent: { primary: '#3b82f6', secondary: '#6366f1', glow: 'rgba(59,130,246,0.15)' },
    surface: { DEFAULT: '#d8e4ff', hover: '#c8d8ff', border: 'rgba(59,130,246,0.15)' },
    text: { primary: '#0f172a', muted: '#4a6080', faint: '#a0b4d0' },
    gradient: 'linear-gradient(135deg, #3b82f6, #6366f1)',
  },
}

const ThemeContext = createContext()

export function ThemeProvider({ children }) {
  const [themeName, setThemeName] = useState(
    () => localStorage.getItem('trico-theme') || 'midnight'
  )

  const theme = themes[themeName]

  useEffect(() => {
    localStorage.setItem('trico-theme', themeName)
    const root = document.documentElement
    root.style.setProperty('--bg-primary', theme.bg.primary)
    root.style.setProperty('--bg-secondary', theme.bg.secondary)
    root.style.setProperty('--bg-tertiary', theme.bg.tertiary)
    root.style.setProperty('--accent-primary', theme.accent.primary)
    root.style.setProperty('--accent-secondary', theme.accent.secondary)
    root.style.setProperty('--accent-glow', theme.accent.glow)
    root.style.setProperty('--surface', theme.surface.DEFAULT)
    root.style.setProperty('--surface-hover', theme.surface.hover)
    root.style.setProperty('--surface-border', theme.surface.border)
    root.style.setProperty('--text-primary', theme.text.primary)
    root.style.setProperty('--text-muted', theme.text.muted)
    root.style.setProperty('--text-faint', theme.text.faint)
    root.style.setProperty('--gradient', theme.gradient)
    document.body.style.backgroundColor = theme.bg.primary
    document.body.style.color = theme.text.primary
  }, [themeName, theme])

  return (
    <ThemeContext.Provider value={{ themeName, setThemeName, theme, themes }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}