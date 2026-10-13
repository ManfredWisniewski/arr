import type { MetadataRoute } from 'next'

import { getSiteUrl } from '@/lib/site'

export default async function robots(): Promise<MetadataRoute.Robots> {
  const base = await getSiteUrl()
  return {
    rules: [
      {
        allow: '/',
        disallow: ['/admin', '/api', '/preview'],
        userAgent: '*',
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  }
}
