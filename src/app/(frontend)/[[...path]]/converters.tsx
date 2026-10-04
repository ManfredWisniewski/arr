import type {
  DefaultNodeTypes,
  SerializedBlockNode,
  SerializedUploadNode,
} from '@payloadcms/richtext-lexical'
import type { JSXConvertersFunction } from '@payloadcms/richtext-lexical/react'
import React from 'react'

import type { Media } from '@/payload-types'
import { Figure } from '@/components/molecules/figure'

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

export const jsxConverters: JSXConvertersFunction<DefaultNodeTypes> = ({
  defaultConverters,
}) => ({
  ...defaultConverters,
  upload,
  blocks: { Code },
})
