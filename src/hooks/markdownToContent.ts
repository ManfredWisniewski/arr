import type {
  CollectionBeforeValidateHook,
  RichTextField,
} from 'payload'
import {
  convertMarkdownToLexical,
  editorConfigFactory,
} from '@payloadcms/richtext-lexical'

// Regenerates `content` (Lexical) from `markdownRaw` whenever markdown is sent
// and differs from the stored value. Updates without `markdownRaw` (or with an
// unchanged one) leave `content` untouched, so manual admin edits are kept.
// Applies to every collection exposing markdownRaw + content (pages, posts).
export const markdownToContent: CollectionBeforeValidateHook = ({
  collection,
  data,
  operation,
  originalDoc,
}) => {
  const markdown = (data as { markdownRaw?: unknown } | undefined)?.markdownRaw

  if (typeof markdown !== 'string' || markdown.length === 0) {
    return data
  }
  if (
    operation === 'update' &&
    (originalDoc as { markdownRaw?: unknown } | undefined)?.markdownRaw ===
      markdown
  ) {
    return data
  }

  const contentField = collection?.fields.find(
    (f): f is RichTextField =>
      'name' in f && f.name === 'content' && f.type === 'richText',
  )
  if (!contentField) {
    return data
  }
  const editorConfig = editorConfigFactory.fromField({ field: contentField })
  ;(data as { content?: unknown }).content = convertMarkdownToLexical({
    editorConfig,
    markdown,
  })
  return data
}
