// Tiny className joiner — semantic-class contract, no tailwind-merge needed.
export const cx = (...parts: Array<false | null | string | undefined>) =>
  parts.filter(Boolean).join(' ')
