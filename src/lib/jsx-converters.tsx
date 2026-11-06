import type {
  DefaultNodeTypes,
  SerializedAutoLinkNode,
  SerializedBlockNode,
  SerializedHeadingNode,
  SerializedLinkNode,
  SerializedUploadNode,
} from '@payloadcms/richtext-lexical'
import type {
  JSXConverterArgs,
  JSXConvertersFunction,
} from '@payloadcms/richtext-lexical/react'
import React from 'react'

import { draftMode } from 'next/headers'

import type { Media } from '@/payload-types'
import { Link } from '@/components/atoms/link'
import { Figure } from '@/components/molecules/figure'
import { WitSpace, type WitSpaceAuthor } from '@/components/organisms/wit-space'
import { getAgents, getMediaUrl } from '@/lib/blog'

// Heading nodes may carry an explicit anchor id (markdown `{#some-id}`,
// stamped by the markdownToContent hook — see lib/markdownAttributes.ts);
// rendered as the element id so /path#id fragment links can target it.
const HEADING_TAGS = new Set(['h1', 'h2', 'h3', 'h4', 'h5', 'h6'])

const heading = ({
  node,
  nodesToJSX,
}: JSXConverterArgs<SerializedHeadingNode>) => {
  const children = nodesToJSX({ nodes: node.children })
  const Tag = HEADING_TAGS.has(node.tag) ? node.tag : 'h1'
  const { id } = node as SerializedHeadingNode & { id?: unknown }
  return <Tag {...(typeof id === 'string' && id ? { id } : {})}>{children}</Tag>
}

// Upload nodes hold the populated media document when depth > 0 (default).
const upload = ({ node }: { node: SerializedUploadNode }) => {
  const media = node.value as Media | number | undefined
  if (!media || typeof media !== 'object') {
    return null
  }
  return <Figure media={media} />
}

// CodeBlock() from the pages editor serializes as a block node
// (blockType "Code").
const Code = ({
  node,
}: {
  node: SerializedBlockNode<{ code?: string; language?: string }>
}) => (
  <pre>
    <code data-language={node.fields?.language ?? undefined}>
      {node.fields?.code ?? ''}
    </code>
  </pre>
)

// witSpace block serializes its fields directly on the node
// (blockType "witSpace"); nulls fall back to the component defaults.
// `authors` rows hold agent slugs — resolved async against the
// structures doc (name/role/avatar → /blog/<slug> cards).
const WitSpaceScene = async ({
  node,
}: {
  node: SerializedBlockNode<{
    authors?: { agent?: null | string; face?: null | string; vert?: null | number }[]
    depth?: number
    maxTilt?: number
    size?: number
  }>
}) => {
  const rows = node.fields?.authors ?? []
  let authors: WitSpaceAuthor[] = []
  if (rows.length) {
    const draft = (await draftMode()).isEnabled
    const agents = await getAgents(draft)
    authors = (
      await Promise.all(
        rows.map(async (row): Promise<null | WitSpaceAuthor> => {
          const agent = agents.find((a) => a.slug === row.agent)
          if (!agent || row.vert == null) {
            return null
          }
          return {
            face: row.face === 'near' || row.face === 'far' ? row.face : undefined,
            href: `/blog/${agent.slug}`,
            name: agent.name,
            picture: await getMediaUrl(agent.avatar, draft, 'avatar'),
            role: agent.role,
            vert: row.vert,
          }
        }),
      )
    ).filter((a): a is WitSpaceAuthor => a !== null)
  }
  return (
    <WitSpace
      authors={authors}
      depth={node.fields?.depth ?? undefined}
      maxTilt={node.fields?.maxTilt ?? undefined}
      size={node.fields?.size ?? undefined}
    />
  )
}

// Rich-text links go through the Link atom, which implements the target
// policy (D08): absolute http(s) URLs open in a new tab, everything else
// in the same tab. `fields.target` (markdown `{target="…"}` override —
// lib/markdownAttributes.ts) beats both the atom's URL rule and the
// editor's newTab flag.
const link = ({
  node,
  nodesToJSX,
}: JSXConverterArgs<SerializedAutoLinkNode | SerializedLinkNode>) => {
  const children = nodesToJSX({ nodes: node.children })
  let href = node.fields.url ?? ''
  if ('linkType' in node.fields && node.fields.linkType === 'internal') {
    const doc = node.fields.doc?.value
    const path =
      doc && typeof doc === 'object' && 'path' in doc ? doc.path : null
    href = typeof path === 'string' && path ? `/${path.replace(/^\/+/, '')}` : ''
  }
  if (!href) {
    return children
  }
  const explicit = (node.fields as { target?: unknown }).target
  const targetProps =
    typeof explicit === 'string' && explicit
      ? {
          target: explicit,
          ...(explicit === '_blank' ? { rel: 'noopener noreferrer' } : {}),
        }
      : node.fields.newTab
        ? { rel: 'noopener noreferrer', target: '_blank' }
        : {}
  return (
    <Link href={href} {...targetProps}>
      {children}
    </Link>
  )
}

export const jsxConverters: JSXConvertersFunction<DefaultNodeTypes> = ({
  defaultConverters,
}) => ({
  ...defaultConverters,
  heading,
  upload,
  autolink: link,
  link,
  blocks: { Code, witSpace: WitSpaceScene },
})
