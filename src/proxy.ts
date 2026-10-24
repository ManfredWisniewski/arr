import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

// Payload buffers JSON request bodies unbounded before access control
// (addDataAndFileToRequest -> req.text()). Reject oversized bodies here;
// proxyClientMaxBodySize in next.config.ts additionally caps the actual
// stream for chunked requests without Content-Length.
const MAX_API_BODY = 1_048_576

export function proxy(request: NextRequest) {
  const length = Number(request.headers.get('content-length') ?? 0)
  if (Number.isFinite(length) && length > MAX_API_BODY) {
    return new NextResponse('Payload Too Large', { status: 413 })
  }
  return NextResponse.next()
}

export const config = {
  matcher: ['/api/:path*'],
}
