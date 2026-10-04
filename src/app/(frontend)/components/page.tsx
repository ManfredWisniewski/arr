import { notFound } from 'next/navigation'
import { getPayload } from 'payload'
import React from 'react'

import type { Media } from '@/payload-types'
import config from '@/payload.config'

import { Badge, Button, Heading, Icon, Img, Input, Lead, Link, Paragraph } from '@/components/atoms'
import { Figure, NavList } from '@/components/molecules'

import { ModalDemo } from './modal-demo'

// Dev-only component showcase — every atom/molecule/organism rendered with
// fixture props under the pushed theme. Static segment wins over the
// [[...path]] catch-all; a content page at /components would be shadowed.
export default async function ComponentsShowcase() {
  if (process.env.NODE_ENV === 'production') {
    notFound()
  }

  // reuse the theme logo as media fixture for Figure/Img
  let media: Media | null = null
  try {
    const payload = await getPayload({ config: await config })
    const theme = await payload.findGlobal({ slug: 'theme' })
    if (theme?.logo && typeof theme.logo === 'object') {
      media = theme.logo as Media
    }
  } catch {
    media = null
  }

  return (
    <article className="page">
      <Heading level={1}>Component showcase</Heading>
      <Lead>
        Every atom, molecule and organism under the currently pushed theme —
        use the theme widgets to check variants.
      </Lead>

      <Heading level={2}>Atoms</Heading>

      <Heading level={3}>Text</Heading>
      <Heading level={2}>Heading 2</Heading>
      <Heading level={3}>Heading 3</Heading>
      <Heading level={4}>Heading 4</Heading>
      <Paragraph>Paragraph — Fließtext mit normalem Satzbild.</Paragraph>
      <Paragraph>
        Badge: <Badge>Neu</Badge> <Badge>SEO</Badge>
      </Paragraph>

      <Heading level={3}>Button</Heading>
      <div className="page-actions">
        <Button variant="primary">Primary</Button>
        <Button variant="secondary">Secondary</Button>
        <Button>Base</Button>
        <Button href="/" variant="primary">
          Link-Button
        </Button>
      </div>

      <Heading level={3}>Link</Heading>
      <Paragraph>
        <Link href="/">Internal link</Link> ·{' '}
        <Link href="https://witconsult.de">External link</Link>
      </Paragraph>

      <Heading level={3}>Icon</Heading>
      <Paragraph>
        <Icon name="menu" /> menu · <Icon name="close" /> close ·{' '}
        <Icon name="external" /> external · <Icon name="check" /> check
      </Paragraph>

      <Heading level={3}>Input</Heading>
      <Paragraph>
        <Input aria-label="Demo" placeholder="input demo" />
      </Paragraph>

      <Heading level={3}>Image</Heading>
      {media?.url ? (
        <Paragraph>
          <Img alt={media.alt} src={media.url} style={{ maxWidth: '12rem' }} />
        </Paragraph>
      ) : (
        <Paragraph>No media fixture (push a theme logo first).</Paragraph>
      )}

      <Heading level={2}>Molecules</Heading>

      <Heading level={3}>NavList</Heading>
      <NavList
        items={[
          { children: [], label: 'Start', path: '/' },
          {
            children: [
              { children: [], label: 'Unterseite', path: '/bereich/unterseite' },
            ],
            label: 'Bereich',
            path: '/bereich',
          },
        ]}
      />

      <Heading level={3}>Figure</Heading>
      {media ? (
        <Figure media={{ ...media, caption: 'Figure caption (theme logo)' }} />
      ) : (
        <Paragraph>No media fixture (push a theme logo first).</Paragraph>
      )}

      <Heading level={2}>Organisms</Heading>

      <Heading level={3}>Modal</Heading>
      <ModalDemo />

      <Paragraph>
        SiteHeader, SiteFooter and the theme toggle frame this page.
      </Paragraph>
    </article>
  )
}
