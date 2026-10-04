'use client'

import { useEffect, useRef } from 'react'

const THEME_KEY = 'arr.theme'

const applyTheme = (pref: string) => {
  const dark =
    pref === 'dark' ||
    (pref !== 'light' &&
      window.matchMedia('(prefers-color-scheme: dark)').matches)
  if (dark) {
    document.documentElement.dataset.theme = 'dark'
  } else {
    delete document.documentElement.dataset.theme
  }
}

// Light/dark choice per +wit/design design-tokens.md: stored preference key
// `arr.theme`, options system/light/dark; "system" clears the stored value
// and follows prefers-color-scheme, including live changes. The matching
// pre-paint script lives in the root layout <head>.
export function ThemeToggle() {
  const selectRef = useRef<HTMLSelectElement>(null)

  useEffect(() => {
    const pref = localStorage.getItem(THEME_KEY) ?? 'system'
    if (selectRef.current) {
      selectRef.current.value = pref
    }
    applyTheme(pref)
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = () => {
      if (!localStorage.getItem(THEME_KEY)) {
        applyTheme('system')
      }
    }
    media.addEventListener('change', onChange)
    return () => media.removeEventListener('change', onChange)
  }, [])

  return (
    <select
      aria-label="Farbschema"
      className="theme-toggle"
      defaultValue="system"
      onChange={(event) => {
        const pref = event.target.value
        if (pref === 'system') {
          localStorage.removeItem(THEME_KEY)
        } else {
          localStorage.setItem(THEME_KEY, pref)
        }
        applyTheme(pref)
      }}
      ref={selectRef}
    >
      <option value="system">System</option>
      <option value="light">Hell</option>
      <option value="dark">Dunkel</option>
    </select>
  )
}
