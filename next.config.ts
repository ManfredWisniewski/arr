import { withPayload } from '@payloadcms/next/withPayload'
import type { NextConfig } from 'next'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(__filename)

const nextConfig: NextConfig = {
  output: 'standalone',
  experimental: {
    // caps the request body stream for requests passing through src/proxy.ts
    // — must cover multipart media uploads (JSON stays at 1 MB via proxy.ts)
    proxyClientMaxBodySize: '8mb',
  },
  // [::1] (IPv6 loopback) and the LAN IP are not in the default dev-origin
  // allowlist — without this every /_next asset 403s and hydration dies
  // when browsing the dev server from those origins.
  allowedDevOrigins: ['[::1]', '127.0.0.1', 'localhost', '192.168.2.135', '192.168.2.80'],
  images: {
    localPatterns: [
      {
        pathname: '/api/media/file/**',
      },
    ],
  },
  // /<name>.vcf at the domain root serves the matching media/ upload as
  // a vCard download — resolved in src/app/(frontend)/vcf/[file]
  async rewrites() {
    return [
      { source: '/:file([^/]+\\.vcf)', destination: '/vcf/:file' },
      // public/docs/ is the Docusaurus static export — Next refuses
      // directory access, so directory URLs resolve to their index.html
      // (checked before the [[...path]] catch-all page route)
      { source: '/docs', destination: '/docs/index.html' },
      { source: '/docs/', destination: '/docs/index.html' },
      { source: '/docs/:path+/', destination: '/docs/:path+/index.html' },
      // non-trailing-slash URLs (/docs/de) — the catch-all would
      // otherwise treat them as app pages and 404
      { source: '/docs/:path+', destination: '/docs/:path+/index.html' },
    ]
  },
  webpack: (webpackConfig) => {
    webpackConfig.resolve.extensionAlias = {
      '.cjs': ['.cts', '.cjs'],
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
      '.mjs': ['.mts', '.mjs'],
    }

    return webpackConfig
  },
  turbopack: {
    root: path.resolve(dirname),
  },
}

export default withPayload(nextConfig, { devBundleServerPackages: false })
