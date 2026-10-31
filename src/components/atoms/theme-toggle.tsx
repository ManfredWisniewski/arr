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
// `arr.theme`, options system/light/dark; no stored value defaults to
// "light" on all sites, "system" is an explicit stored choice that follows
// prefers-color-scheme, including live changes. The matching pre-paint
// script lives in the root layout <head>.
export function ThemeToggle() {
  const selectRef = useRef<HTMLSelectElement>(null)

  useEffect(() => {
    const pref = localStorage.getItem(THEME_KEY) ?? 'light'
    if (selectRef.current) {
      selectRef.current.value = pref
    }
    applyTheme(pref)
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = () => {
      if (!localStorage.getItem(THEME_KEY)) {
        applyTheme('light')
      }
    }
    media.addEventListener('change', onChange)
    return () => media.removeEventListener('change', onChange)
  }, [])

  return (
    <select
      aria-label="Farbschema"
      className="theme-toggle"
      defaultValue="light"
      onChange={(event) => {
        const pref = event.target.value
        localStorage.setItem(THEME_KEY, pref)
        // a mode choice wins over a dev variant — clear it so the
        // pushed theme applies, and reset the dev switcher's select
        localStorage.removeItem('theme-variant')
        delete document.documentElement.dataset.variant
        window.dispatchEvent(new Event('arr:theme-mode'))
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
