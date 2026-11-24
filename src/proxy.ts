import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

// Payload buffers JSON request bodies unbounded before access control
// (addDataAndFileToRequest -> req.text()). Reject oversized bodies here;
// proxyClientMaxBodySize in next.config.ts additionally caps the actual
// stream for chunked requests without Content-Length. Multipart media
// uploads stream through Payload's file handler instead — they get a
// higher ceiling than JSON bodies.
const MAX_JSON_BODY = 1_048_576
const MAX_UPLOAD_BODY = 8_388_608

export function proxy(request: NextRequest) {
  const length = Number(request.headers.get('content-length') ?? 0)
  const isUpload = request.headers
    .get('content-type')
    ?.startsWith('multipart/form-data')
  const max = isUpload ? MAX_UPLOAD_BODY : MAX_JSON_BODY
  if (Number.isFinite(length) && length > max) {
    return new NextResponse('Payload Too Large', { status: 413 })
  }
  const response = NextResponse.next()
  // Media files carry no cache headers from Payload — without them every
  // page load re-downloads. Content changes get fresh filenames (Payload
  // dedupes to name-1.ext), so long immutable caching is safe.
  if (request.nextUrl.pathname.startsWith('/api/media/file/')) {
    response.headers.set(
      'Cache-Control',
      'public, max-age=31536000, immutable',
    )
  }
  return response
}

export const config = {
  matcher: ['/api/:path*'],
}
