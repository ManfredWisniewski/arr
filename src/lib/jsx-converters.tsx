import type {
  DefaultNodeTypes,
  SerializedAutoLinkNode,
  SerializedBlockNode,
  SerializedLinkNode,
  SerializedUploadNode,
} from '@payloadcms/richtext-lexical'
import type {
  JSXConverterArgs,
  JSXConvertersFunction,
} from '@payloadcms/richtext-lexical/react'
import React from 'react'

import type { Media } from '@/payload-types'
import { Link } from '@/components/atoms/link'
import { Figure } from '@/components/molecules/figure'
import { WitSpace } from '@/components/organisms/wit-space'

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
const WitSpaceScene = ({
  node,
}: {
  node: SerializedBlockNode<{ depth?: number; maxTilt?: number; size?: number }>
}) => (
  <WitSpace
    depth={node.fields?.depth ?? undefined}
    maxTilt={node.fields?.maxTilt ?? undefined}
    size={node.fields?.size ?? undefined}
  />
)

// Rich-text links go through the Link atom: external URLs open in a new
// tab by default, internal paths through next/link. The editor's newTab
// flag is still honored for internal links.
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
  return (
    <Link
      href={href}
      {...(node.fields.newTab
        ? { rel: 'noopener noreferrer', target: '_blank' }
        : {})}
    >
      {children}
    </Link>
  )
}

export const jsxConverters: JSXConvertersFunction<DefaultNodeTypes> = ({
  defaultConverters,
}) => ({
  ...defaultConverters,
  upload,
  autolink: link,
  link,
  blocks: { Code, witSpace: WitSpaceScene },
})
