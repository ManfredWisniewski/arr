import type {
  CollectionBeforeValidateHook,
  RichTextField,
} from 'payload'
import {
  convertMarkdownToLexical,
  editorConfigFactory,
} from '@payloadcms/richtext-lexical'

import {
  applyHeadingAnchors,
  applyLinkAttributes,
  extractHeadingAnchors,
} from '../../../lib/markdownAttributes'

// Multi-section variant of hooks/markdownToContent (spec
// +wit/specs/arr/jobs/, FR-002): jobs carry five rich-text sections, each
// fed by its own `<name>Raw` markdown field pushed by the pipeline. Same
// semantics as the original — regenerate only when the raw value changed.
export const markdownToSections = (
  pairs: [rawField: string, richField: string][],
): CollectionBeforeValidateHook =>
  ({ collection, data, operation, originalDoc }) => {
    for (const [rawName, richName] of pairs) {
      const markdown = (data as Record<string, unknown> | undefined)?.[
        rawName
      ]

      if (typeof markdown !== 'string' || markdown.length === 0) {
        continue
      }
      if (
        operation === 'update' &&
        (originalDoc as Record<string, unknown> | undefined)?.[rawName] ===
          markdown
      ) {
        continue
      }

      const richField = collection?.fields.find(
        (f): f is RichTextField =>
          'name' in f && f.name === richName && f.type === 'richText',
      )
      if (!richField) {
        continue
      }
      const editorConfig = editorConfigFactory.fromField({
        field: richField,
      })
      const { anchors, markdown: stripped } =
        extractHeadingAnchors(markdown)
      const content = convertMarkdownToLexical({
        editorConfig,
        markdown: stripped,
      })
      applyHeadingAnchors(content, anchors)
      applyLinkAttributes(content)
      ;(data as Record<string, unknown>)[richName] = content
    }
    return data
  }
