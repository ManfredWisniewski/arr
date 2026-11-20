import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import createMiddleware from 'next-intl/middleware'

import { routing } from './i18n/routing'

// Next 16 merged the middleware/proxy split into a single proxy.ts —
// this file carries both responsibilities:
//
// 1. /api/:path* — Payload buffers JSON request bodies unbounded before
//    access control (addDataAndFileToRequest -> req.text()). Reject
//    oversized bodies here; proxyClientMaxBodySize in next.config.ts
//    additionally caps the actual stream for chunked requests without
//    Content-Length. Multipart media uploads stream through Payload's
//    file handler instead — they get a higher ceiling than JSON bodies.
//    Media responses additionally get long immutable caching (content
//    changes get fresh filenames — Payload dedupes to name-1.ext).
// 2. everything else in the matcher — next-intl locale negotiation:
//    sets the x-next-intl-locale request header and redirects
//    unprefixed frontend URLs ("/" -> "/de"). Payload admin/API/draft
//    preview, Next internals and file paths are excluded (feeds,
//    sitemap, robots.txt resolve their locale from the [lang] route
//    param instead).
const MAX_JSON_BODY = 1_048_576
const MAX_UPLOAD_BODY = 8_388_608

const intl = createMiddleware(routing)

export function proxy(request: NextRequest) {
  if (!request.nextUrl.pathname.startsWith('/api/')) {
    return intl(request)
  }
  const length = Number(request.headers.get('content-length') ?? 0)
  const isUpload = request.headers
    .get('content-type')
    ?.startsWith('multipart/form-data')
  const max = isUpload ? MAX_UPLOAD_BODY : MAX_JSON_BODY
  if (Number.isFinite(length) && length > max) {
    return new NextResponse('Payload Too Large', { status: 413 })
  }
  const response = NextResponse.next()
  if (request.nextUrl.pathname.startsWith('/api/media/file/')) {
    response.headers.set(
      'Cache-Control',
      'public, max-age=31536000, immutable',
    )
  }
  return response
}

export const config = {
  matcher: ['/api/:path*', '/((?!admin|api|preview|_next|_vercel|.*\..*).*)'],
}
