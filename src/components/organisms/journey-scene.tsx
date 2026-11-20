'use client'

import * as React from 'react'

// Scroll-scrubbed parallax backdrop for the `journey` template (after
// codepen.io/isladjan/pen/abdyPBw): one full-viewport SVG pinned via
// position:sticky inside .journey-sticky while .journey-track scrolls
// over it. The driver writes --jp (0..1 over the whole article); all
// layer speeds, the sinking sun, dusk fade and stage-card timing derive
// from it in shell.css — markup contract is .journey*, scenery fills are
// --journey-* vars (theme-set, else token fallbacks). No JS or reduced
// motion → no is-live → plain stacked cards.
export const JourneyScene = () => {
  const ref = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const host = ref.current?.closest<HTMLElement>('.journey')
    if (!host || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return
    }
    host.classList.add('is-live')
    let raf = 0
    let target = 0
    let current = 0
    const measure = () => {
      const rect = host.getBoundingClientRect()
      const runway = rect.height - window.innerHeight
      target = runway > 0 ? Math.min(1, Math.max(0, -rect.top / runway)) : 0
    }
    const tick = () => {
      // lerp toward the scroll target — the GSAP scrub:N equivalent
      current += (target - current) * 0.1
      host.style.setProperty('--jp', current.toFixed(4))
      raf = requestAnimationFrame(tick)
    }
    measure()
    tick()
    window.addEventListener('scroll', measure, { passive: true })
    window.addEventListener('resize', measure)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('scroll', measure)
      window.removeEventListener('resize', measure)
      host.classList.remove('is-live')
      host.style.removeProperty('--jp')
    }
  }, [])

  return (
    <div className="journey-sticky" ref={ref}>
      <svg
        aria-hidden="true"
        className="journey-scene"
        preserveAspectRatio="xMidYMid slice"
        viewBox="0 0 1600 900"
      >
        <rect className="journey-sky" height="900" width="1600" />
        <g className="journey-stars">
          {[
            [140, 90], [320, 210], [470, 60], [640, 150], [780, 70],
            [930, 190], [1080, 90], [1220, 230], [1360, 120], [1490, 200],
            [240, 330], [560, 300], [880, 340], [1190, 320], [1440, 360],
          ].map(([cx, cy]) => (
            <circle cx={cx} cy={cy} key={`${cx}-${cy}`} r="2.5" />
          ))}
        </g>
        <circle className="journey-sun" cx="1180" cy="230" r="95" />
        {/* Placeholder silhouettes until the per-stage illustrations land;
            --far/--mid/--near move at different --jp rates = parallax. */}
        <path
          className="journey-hill journey-hill--far"
          d="M0 560 C 200 510 420 600 640 565 C 880 528 1080 590 1280 555 C 1420 530 1520 545 1600 560 V900 H0 Z"
        />
        <path
          className="journey-hill journey-hill--mid"
          d="M0 660 C 240 610 480 700 760 665 C 1020 632 1240 705 1440 670 C 1520 655 1570 655 1600 660 V900 H0 Z"
        />
        <path
          className="journey-hill journey-hill--near"
          d="M0 780 C 280 720 560 820 860 775 C 1120 738 1380 815 1600 780 V900 H0 Z"
        />
        <rect className="journey-sky-dusk" height="900" width="1600" />
      </svg>
    </div>
  )
}
