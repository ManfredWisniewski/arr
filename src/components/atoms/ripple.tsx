'use client'

import React from 'react'

// M3 ink ripple — drop inside a `position: relative; overflow: hidden`
// interactive element; registers pointerdown on its parent and animates
// an ink circle from the press point (.ripple host, .ripple-ink circles).
// Honors prefers-reduced-motion.
export const Ripple = () => {
  const ref = React.useRef<HTMLSpanElement | null>(null)

  React.useEffect(() => {
    const el = ref.current
    const host = el?.parentElement
    if (!el || !host) {
      return
    }

    const onDown = (event: PointerEvent) => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        return
      }
      const rect = host.getBoundingClientRect()
      const size = Math.max(rect.width, rect.height) * 2
      const ink = document.createElement('span')
      ink.className = 'ripple-ink'
      Object.assign(ink.style, {
        position: 'absolute',
        left: `${event.clientX - rect.left - size / 2}px`,
        top: `${event.clientY - rect.top - size / 2}px`,
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: '50%',
        background: 'currentColor',
        opacity: '0.12',
        transform: 'scale(0)',
        transition: 'transform 450ms ease-out, opacity 600ms ease-out 150ms',
        pointerEvents: 'none',
      })
      el.appendChild(ink)
      requestAnimationFrame(() => {
        ink.style.transform = 'scale(1)'
        ink.style.opacity = '0'
      })
      window.setTimeout(() => ink.remove(), 900)
    }

    host.addEventListener('pointerdown', onDown)
    return () => host.removeEventListener('pointerdown', onDown)
  }, [])

  return <span aria-hidden className="ripple" ref={ref} />
}
