'use client'

import { useEffect, useRef } from 'react'

// Dev-only widget: switches the page between the compiled biti theme
// variants by setting `data-theme` on <html>. Empty value = pushed theme.
export function ThemeSwitcher({ variants }: { variants: string[] }) {
  const selectRef = useRef<HTMLSelectElement>(null)

  useEffect(() => {
    const saved = localStorage.getItem('theme-variant') ?? ''
    if (saved) {
      document.documentElement.dataset.theme = saved
    }
    if (selectRef.current) {
      selectRef.current.value = saved
    }
  }, [])

  const onChange = (next: string) => {
    if (next) {
      document.documentElement.dataset.theme = next
    } else {
      delete document.documentElement.dataset.theme
    }
    localStorage.setItem('theme-variant', next)
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
