'use client'

import React, { useState } from 'react'

// Split submenu trigger (shell.css contract: `.nav-caret` button next to the
// link). Toggles `.is-open` on the parent `li` for non-hover interaction;
// hover/focus-within open the band without JS.
export function NavCaret({ label }: { label: string }) {
  const [open, setOpen] = useState(false)
  return (
    <button
      aria-expanded={open}
      aria-label={`${label}: Untermenü`}
      className="nav-caret"
      onClick={(event) => {
        const next = !open
        setOpen(next)
        event.currentTarget.closest('li')?.classList.toggle('is-open', next)
      }}
      type="button"
    />
  )
}
