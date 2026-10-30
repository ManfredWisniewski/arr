import { render, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { SlideDeck } from '@/components/organisms/slide-deck'

// reveal.js needs a real layout engine — stub it and assert the DOM
// contract the deck relies on instead (textarea payload, separators).
vi.mock('reveal.js', () => ({
  default: class Reveal {
    initialize = () => Promise.resolve()
    destroy = () => {}
    configure = () => {}
    layout = () => {}
  },
}))
vi.mock('reveal.js/plugin/markdown/markdown.esm.js', () => ({
  default: { id: 'markdown' },
}))
vi.mock('reveal.js/plugin/notes/notes.esm.js', () => ({
  default: { id: 'notes' },
}))
vi.mock('mermaid', () => ({
  default: { initialize: () => {}, run: () => Promise.resolve() },
}))

const DECK = '# One\n\nfirst\n\n---\n\n# Two\n\nsecond\n\nNote: a note\n'

describe('SlideDeck', () => {
  it('hands the deck markdown to reveal via a data-template textarea', async () => {
    const { container } = render(
      <SlideDeck markdown={DECK} options={{ height: 540, width: 960 }} />,
    )
    const textarea = container.querySelector('textarea[data-template]')
    expect(textarea?.textContent).toBe(DECK)
    const section = container.querySelector('section[data-markdown]')
    expect(section?.getAttribute('data-separator')).toBe('\\r?\\n---\\r?\\n')
    expect(section?.getAttribute('data-separator-vertical')).toBe(
      '\\r?\\n----\\r?\\n',
    )
    const viewport = container.querySelector<HTMLElement>('.reveal-viewport')
    expect(viewport?.style.aspectRatio).toBe('960 / 540')
    await waitFor(() =>
      expect(
        container.querySelector('.slide-deck')?.hasAttribute('data-ready'),
      ).toBe(true),
    )
  })
})
