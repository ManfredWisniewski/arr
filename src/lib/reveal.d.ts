// Minimal typings for reveal.js (the package ships none). Covers the
// surface SlideDeck uses; extend as needed.

declare module 'reveal.js' {
  export default class Reveal {
    constructor(
      revealElement?: HTMLElement | null,
      config?: Record<string, unknown>,
    )
    initialize(): Promise<void>
    destroy(): void
    configure(config: Record<string, unknown>): void
    layout(): void
  }
}

declare module 'reveal.js/plugin/*' {
  const plugin: { id?: string }
  export default plugin
}
