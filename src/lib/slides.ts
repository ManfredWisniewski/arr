// Shared types for the `slide` template: HedgeDoc `slideOptions` front
// matter mapped onto reveal.js config keys.

export type SlideOptions = {
  theme?: string
  transition?: string
  transitionSpeed?: string
  backgroundTransition?: string
  width?: number
  height?: number
  margin?: number
  minScale?: number
  maxScale?: number
  autoSlide?: number
  autoSlideInterval?: number
  loop?: boolean
  slideNumber?: boolean | string
}

// Payload `json` fields come back as `unknown`; narrow to the options
// shape and drop anything that isn't a plain object.
export const asSlideOptions = (value: unknown): SlideOptions | undefined =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? (value as SlideOptions)
    : undefined
