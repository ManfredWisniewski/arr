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
  const [ready, setReady] = React.useState(false)
  const width = Number(options?.width) || 960
  const height = Number(options?.height) || 700
  const optionsKey = JSON.stringify(options ?? {})
  const deckKey = `${optionsKey}\n${markdown}`

  // derived state: a new deck resets readiness during render (no effect)
  const [prevDeckKey, setPrevDeckKey] = React.useState(deckKey)
  if (prevDeckKey !== deckKey) {
    setPrevDeckKey(deckKey)
    setReady(false)
  }

  React.useEffect(() => {
    let cancelled = false
    let deck:
      | { destroy(): void; initialize(): Promise<void> }
      | undefined
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
        void THEME_CSS[theme]()
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
        await deck.initialize()
        await renderMermaid(revealEl)
      } catch (error) {
        console.error('SlideDeck failed to initialize', error)
      } finally {
        if (!cancelled) {
          setReady(true)
        }
      }
    }
    void boot()
    return () => {
      cancelled = true
      deck?.destroy()
    }
  }, [markdown, optionsKey])

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
        style={{ aspectRatio: `${width} / ${height}` }}
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
        aria-label="Vollbild"
        className="slide-deck-fullscreen"
        icon="expand"
        onClick={toggleFullscreen}
        variant="standard"
      />
    </div>
  )
}
