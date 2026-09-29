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
export const markdownToContent: CollectionBeforeValidateHook = ({
  data,
  operation,
  originalDoc,
  req,
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

  const contentField = req.payload.collections.pages.config.fields.find(
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
