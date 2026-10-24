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
    proxyClientMaxBodySize: '2mb',
  },
  // [::1] (IPv6 loopback) and the LAN IP are not in the default dev-origin
  // allowlist — without this every /_next asset 403s and hydration dies
  // when browsing the dev server from those origins.
  allowedDevOrigins: ['[::1]', '192.168.2.135'],
  images: {
    localPatterns: [
      {
        pathname: '/api/media/file/**',
      },
    ],
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
