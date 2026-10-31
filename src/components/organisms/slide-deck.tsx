'use client'

import React from 'react'

import type { SlideOptions } from '@/lib/slides'

import { IconButton } from '../atoms/icon-button'

import 'reveal.js/dist/reveal.css'

// HedgeDoc theme names map 1:1 onto bundled reveal.js themes. The record
// keeps every specifier literal so the bundler resolves them statically;
// unknown/absent themes fall back to 'black' (the HedgeDoc default).
const THEME_CSS: Record<string, () => Promise<unknown>> = {
  beige: () => import('reveal.js/dist/theme/beige.css'),
  black: () => import('reveal.js/dist/theme/black.css'),
  'black-contrast': () => import('reveal.js/dist/theme/black-contrast.css'),
  blood: () => import('reveal.js/dist/theme/blood.css'),
  dracula: () => import('reveal.js/dist/theme/dracula.css'),
  league: () => import('reveal.js/dist/theme/league.css'),
  moon: () => import('reveal.js/dist/theme/moon.css'),
  night: () => import('reveal.js/dist/theme/night.css'),
  serif: () => import('reveal.js/dist/theme/serif.css'),
  simple: () => import('reveal.js/dist/theme/simple.css'),
  sky: () => import('reveal.js/dist/theme/sky.css'),
  solarized: () => import('reveal.js/dist/theme/solarized.css'),
  white: () => import('reveal.js/dist/theme/white.css'),
  'white-contrast': () => import('reveal.js/dist/theme/white-contrast.css'),
}

// reveal.js config keys read from `slideOptions`; the rest of the front
// matter is ignored.
const CONFIG_KEYS = [
  'autoSlide',
  'autoSlideInterval',
  'backgroundTransition',
  'loop',
  'margin',
  'maxScale',
  'minScale',
  'slideNumber',
  'transition',
  'transitionSpeed',
] as const

// ```mermaid fenced blocks arrive as <pre><code class="language-mermaid">;
// swap them for mermaid's own nodes and render. Failures keep the source
// block visible.
const renderMermaid = async (root: HTMLElement) => {
  const codes = root.querySelectorAll<HTMLElement>(
    'pre > code[class*="language-mermaid"]',
  )
  if (!codes.length) {
    return
  }
  const nodes = Array.from(codes).map((code) => {
    const pre = document.createElement('pre')
    pre.className = 'mermaid'
    pre.textContent = code.textContent ?? ''
    code.parentElement?.replaceWith(pre)
    return pre
  })
  try {
    const mermaid = (await import('mermaid')).default
    mermaid.initialize({ startOnLoad: false })
    await mermaid.run({ nodes })
  } catch {
    // leave whatever mermaid rendered (error svg or source text) in place
  }
}

// HedgeDoc slide-mode document rendered as an embedded reveal.js deck:
// `---` splits horizontal slides, `----` vertical stacks, `Note:` starts
// speaker notes, `<!-- .slide: ... -->` sets slide attributes — same
// separators and plugins HedgeDoc itself runs.
export const SlideDeck = ({
  markdown,
  options,
}: {
  markdown: string
  options?: SlideOptions | null
}) => {
  const rootRef = React.useRef<HTMLDivElement>(null)
  const deckRef = React.useRef<{ toggleOverview(): void } | null>(null)
  const [ready, setReady] = React.useState(false)
  const [overview, setOverview] = React.useState(false)
  const width = Number(options?.width) || 960
  const height = Number(options?.height) || 700
  const optionsKey = JSON.stringify(options ?? {})
  const deckKey = `${optionsKey}\n${markdown}`

  // canvas size may grow beyond slideOptions when slide content is
  // taller than the configured slide box (see fitSlides below)
  const [canvas, setCanvas] = React.useState({ height, width })

  // derived state: a new deck resets readiness + canvas during render
  const [prevDeckKey, setPrevDeckKey] = React.useState(deckKey)
  if (prevDeckKey !== deckKey) {
    setPrevDeckKey(deckKey)
    setReady(false)
    setCanvas({ height, width })
  }

  React.useEffect(() => {
    let cancelled = false
    let deck:
      | {
          configure(c: Record<string, unknown>): void
          destroy(): void
          initialize(): Promise<void>
          layout(): void
          on(event: string, callback: () => void): void
          toggleOverview(): void
        }
      | undefined
    const revealEl = () =>
      rootRef.current?.querySelector<HTMLElement>('.reveal')
    const unbindLoad = () =>
      revealEl()?.removeEventListener('load', fitSlides, true)
    const config = JSON.parse(optionsKey) as SlideOptions

    const boot = async () => {
      try {
        const [RevealModule, MarkdownModule, NotesModule] =
          await Promise.all([
            import('reveal.js'),
            import('reveal.js/plugin/markdown/markdown.esm.js'),
            import('reveal.js/plugin/notes/notes.esm.js'),
          ])
        const theme =
          config.theme && config.theme in THEME_CSS ? config.theme : 'black'
        // awaited: the font scale below measures the themed font-size
        await THEME_CSS[theme]()
        const revealEl =
          rootRef.current?.querySelector<HTMLElement>('.reveal')
        if (cancelled || !revealEl) {
          return
        }
        const overrides = Object.fromEntries(
          CONFIG_KEYS.filter((key) => config[key] !== undefined).map(
            (key) => [key, config[key]],
          ),
        )
        deck = new RevealModule.default(revealEl, {
          controls: true,
          embedded: true,
          hash: true,
          plugins: [MarkdownModule.default, NotesModule.default],
          progress: true,
          ...overrides,
        })
        const api = deck
        await api.initialize()
        await renderMermaid(revealEl)
        // font scale: every theme font size derives from .reveal's
        // computed font-size, so one inline override scales all text
        const fontScale = Number(config.fontScale) || 1
        if (fontScale !== 1) {
          const base = parseFloat(getComputedStyle(revealEl).fontSize)
          if (base) {
            revealEl.style.fontSize = `${base * fontScale}px`
          }
        }
        deckRef.current = api
        api.on('overviewshown', () => setOverview(true))
        api.on('overviewhidden', () => setOverview(false))
        revealEl.addEventListener('load', fitSlides, true)
        fitSlides()
      } catch (error) {
        console.error('SlideDeck failed to initialize', error)
      } finally {
        if (!cancelled) {
          setReady(true)
        }
      }
    }

    // Grow the canvas until the tallest slide fits — reveal renders
    // slides on a fixed width×height canvas, so tall content clips.
    // Hidden slides are display:none and can't be measured directly,
    // so we measure a display:block clone offscreen (slide coords).
    let fitted = height
    const fitSlides = () => {
      const el = revealEl()
      const slidesEl = el?.querySelector<HTMLElement>('.slides')
      if (!el || !slidesEl || !deck) {
        return
      }
      const probe = slidesEl.cloneNode(true) as HTMLElement
      // keep reveal's inline width/height (slide units) — only hide the
      // probe and move it offscreen for measurement
      probe.style.position = 'absolute'
      probe.style.visibility = 'hidden'
      probe.style.left = '-99999px'
      probe.style.top = '0'
      probe
        .querySelectorAll<HTMLElement>('section')
        .forEach((s) => (s.style.display = 'block'))
      el.appendChild(probe)
      const needed = Math.max(
        height,
        ...Array.from(probe.querySelectorAll<HTMLElement>('section')).map(
          (s) => s.scrollHeight,
        ),
      )
      probe.remove()
      if (needed > fitted) {
        fitted = needed
        deck.configure({ height: needed })
        deck.layout()
        setCanvas({ height: needed, width })
      }
    }

    void boot()
    return () => {
      cancelled = true
      unbindLoad()
      deck?.destroy()
    }
  }, [markdown, optionsKey, height, width])

  const toggleFullscreen = () => {
    if (document.fullscreenElement) {
      void document.exitFullscreen()
    } else {
      void rootRef.current?.requestFullscreen?.()
    }
  }

  return (
    <div
      className="slide-deck"
      data-ready={ready || undefined}
      ref={rootRef}
      tabIndex={0}
    >
      {/* re-mount on new input: reveal mutates .slides in place, so a
          fresh deck needs fresh DOM (draft preview / client-side nav) */}
      <div
        className="reveal-viewport"
        key={deckKey}
        style={{ aspectRatio: `${canvas.width} / ${canvas.height}` }}
      >
        <div className="reveal">
          <div className="slides">
            <section
              data-markdown=""
              data-separator="\r?\n---\r?\n"
              data-separator-vertical="\r?\n----\r?\n"
            >
              <textarea data-template defaultValue={markdown} />
            </section>
          </div>
        </div>
      </div>
      <IconButton
        aria-label="Übersicht"
        className="slide-deck-overview"
        icon="grid"
        onClick={() => deckRef.current?.toggleOverview()}
        selected={overview}
        toggle
        variant="standard"
      />
      <IconButton
        aria-label="Vollbild"
        className="slide-deck-fullscreen"
        icon="expand"
        onClick={toggleFullscreen}
        variant="standard"
      />
    </div>
  )
}
