import React, { createContext, useContext, useEffect, useState } from 'react'

export type Theme = 'light' | 'dark'

export interface ColorScheme {
  bg: string
  bgGlass: string
  bgGradient: string
  forest: string
  sage: string
  body: string
  muted: string
  card: string
  cardBorder: string
  surface: string
  surfaceHover: string
  navBorder: string
  input: string
  inputBorder: string
  inputText: string
  placeholder: string
  tag: string
  tagText: string
  buttonSecBg: string
  buttonSecText: string
  buttonSecBorder: string
  shadow: string
}

const light: ColorScheme = {
  bg: '#FBF9F5',
  bgGlass: 'rgba(251,249,245,0.85)',
  bgGradient: 'linear-gradient(160deg, #FBF9F5 0%, #EEF4EF 100%)',
  forest: '#1B3B2B',
  sage: '#A2BFA6',
  body: '#4a6a58',
  muted: '#7a9a86',
  card: 'rgba(255,255,255,0.8)',
  cardBorder: 'rgba(162,191,166,0.3)',
  surface: 'rgba(27,59,43,0.07)',
  surfaceHover: 'rgba(27,59,43,0.04)',
  navBorder: 'rgba(162,191,166,0.2)',
  input: 'rgba(255,255,255,0.7)',
  inputBorder: 'rgba(162,191,166,0.4)',
  inputText: '#1B3B2B',
  placeholder: '#7a9a86',
  tag: 'rgba(162,191,166,0.2)',
  tagText: '#3a6b4a',
  buttonSecBg: 'rgba(255,255,255,0.8)',
  buttonSecText: '#1B3B2B',
  buttonSecBorder: '1.5px solid rgba(162,191,166,0.4)',
  shadow: '0 2px 16px rgba(27,59,43,0.05)',
}

const dark: ColorScheme = {
  bg: '#0E1612',
  bgGlass: 'rgba(14,22,18,0.92)',
  bgGradient: 'linear-gradient(160deg, #0E1612 0%, #121E15 100%)',
  forest: '#E8F5EA',
  sage: '#6a8870',
  body: '#9EC4A4',
  muted: '#4f6e58',
  card: 'rgba(255,255,255,0.05)',
  cardBorder: 'rgba(162,191,166,0.12)',
  surface: 'rgba(232,245,234,0.07)',
  surfaceHover: 'rgba(232,245,234,0.04)',
  navBorder: 'rgba(162,191,166,0.1)',
  input: 'rgba(255,255,255,0.06)',
  inputBorder: 'rgba(162,191,166,0.18)',
  inputText: '#E8F5EA',
  placeholder: '#4f6e58',
  tag: 'rgba(162,191,166,0.12)',
  tagText: '#9EC4A4',
  buttonSecBg: 'rgba(255,255,255,0.06)',
  buttonSecText: '#E8F5EA',
  buttonSecBorder: '1.5px solid rgba(162,191,166,0.18)',
  shadow: '0 2px 16px rgba(0,0,0,0.3)',
}

interface ThemeContextValue {
  theme: Theme
  isDark: boolean
  toggleTheme: () => void
  c: ColorScheme
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: 'light',
  isDark: false,
  toggleTheme: () => {},
  c: light,
})

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    try {
      const saved = localStorage.getItem('koru-theme') as Theme | null
      if (saved === 'light' || saved === 'dark') return saved
    } catch {}
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  })

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('koru-theme', theme)
  }, [theme])

  const toggleTheme = () => setTheme(t => (t === 'light' ? 'dark' : 'light'))

  return (
    <ThemeContext.Provider value={{ theme, isDark: theme === 'dark', toggleTheme, c: theme === 'dark' ? dark : light }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}
