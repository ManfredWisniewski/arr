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
