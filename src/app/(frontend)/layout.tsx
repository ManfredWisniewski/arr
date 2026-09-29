import { getPayload } from 'payload'
import React from 'react'

import type { Theme } from '@/payload-types'
import config from '@/payload.config'
import './styles.css'

async function getTheme(): Promise<null | Theme> {
  try {
    const payload = await getPayload({ config: await config })
    return await payload.findGlobal({ slug: 'theme' })
  } catch {
    // render unstyled rather than fail (e.g. before migrations ran)
    return null
  }
}

export async function generateMetadata() {
  const theme = await getTheme()
  return {
    title: theme?.meta?.siteName ?? 'witconsult',
  }
}

export default async function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props
  const theme = await getTheme()

  return (
    <html lang="de">
      <head>
        {theme?.cssLight ? (
          <style dangerouslySetInnerHTML={{ __html: theme.cssLight }} />
        ) : null}
        {theme?.cssDark ? (
          <style dangerouslySetInnerHTML={{ __html: theme.cssDark }} />
        ) : null}
      </head>
      <body>
        <main>{children}</main>
      </body>
    </html>
  )
}
