'use client'

import { useEffect, useRef } from 'react'

const VARIANT_KEY = 'theme-variant'

// Dev-only widget: switches the page between the compiled biti theme
// variants by setting `data-variant` on <html>. Empty value = pushed
// theme. `data-variant` is decoupled from `data-theme` (the light/dark
// toggle); choosing a light/dark mode there clears the variant — the
// `arr:theme-mode` event resets this select.
export function ThemeSwitcher({ variants }: { variants: string[] }) {
  const selectRef = useRef<HTMLSelectElement>(null)

  useEffect(() => {
    const saved = localStorage.getItem(VARIANT_KEY) ?? ''
    if (saved) {
      document.documentElement.dataset.variant = saved
    }
    if (selectRef.current) {
      selectRef.current.value = saved
    }
    const reset = () => {
      if (selectRef.current) {
        selectRef.current.value = ''
      }
    }
    window.addEventListener('arr:theme-mode', reset)
    return () => window.removeEventListener('arr:theme-mode', reset)
  }, [])

  const onChange = (next: string) => {
    if (next) {
      document.documentElement.dataset.variant = next
    } else {
      delete document.documentElement.dataset.variant
    }
    localStorage.setItem(VARIANT_KEY, next)
  }

  return (
    <div className="theme-switcher">
      <label htmlFor="theme-variant">Theme</label>
      <select
        defaultValue=""
        id="theme-variant"
        onChange={(event) => onChange(event.target.value)}
        ref={selectRef}
      >
        <option value="">Site default</option>
        {variants.map((name) => (
          <option key={name} value={name}>
            {name}
          </option>
        ))}
      </select>
    </div>
  )
}
