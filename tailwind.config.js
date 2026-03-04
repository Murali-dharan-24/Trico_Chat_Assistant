/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: '#0f1117',
          secondary: '#161b27',
          tertiary: '#1e2535',
        },
        accent: {
          primary: '#6c8aff',
          secondary: '#a78bfa',
          glow: 'rgba(108,138,255,0.2)',
        },
        surface: {
          DEFAULT: '#1e2535',
          hover: '#252d40',
          border: 'rgba(255,255,255,0.07)',
        },
        text: {
          primary: '#e2e8f0',
          muted: '#64748b',
          faint: '#334155',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Syne', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        glow: '0 0 20px rgba(108,138,255,0.25)',
        'glow-sm': '0 0 10px rgba(108,138,255,0.15)',
      },
      borderRadius: {
        xl: '14px',
        '2xl': '18px',
      }
    },
  },
  plugins: [],
}