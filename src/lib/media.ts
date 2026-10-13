import type { Media } from '@/payload-types'

// Payload media is stored full-size (AI avatars are ~400 KB PNGs);
// display URLs go through the built-in image optimizer (/_next/image)
// so cards and bylines don't pull originals. Only local
// /api/media/file/** paths are optimizable (next.config localPatterns) —
// anything else passes through unchanged.
export function optimizeMediaUrl(
  url: string | undefined,
  width: number,
  quality = 75,
): string | undefined {
  if (!url || !url.startsWith('/api/media/file/')) {
    return url
  }
  return `/_next/image?url=${encodeURIComponent(url)}&w=${width}&q=${quality}`
}

// Prefer the pre-generated variant (Media.imageSizes) for a display
// context; fall back to the optimizer for docs uploaded before sizes
// existed, then to the raw original for non-media/external URLs.
export function mediaUrl(
  media: Media | null | undefined,
  size: 'avatar' | 'card' | 'content' | 'hero' | 'logo',
  fallbackWidth: number,
): string | undefined {
  return (
    media?.sizes?.[size]?.url ??
    optimizeMediaUrl(media?.url ?? undefined, fallbackWidth)
  )
}
