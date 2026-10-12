import {
  BlocksFeature,
  CodeBlock,
  EXPERIMENTAL_TableFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'

import { WitSpaceBlock } from './blocks/wit-space'

// Editor for the pages.content field: defaults plus code blocks and tables.
// The same adapter must be used for rendering/conversion; the markdown hook
// resolves the sanitized editor config from the sanitized field itself.
export const pagesEditor = lexicalEditor({
  features: ({ defaultFeatures }) => [
    ...defaultFeatures,
    BlocksFeature({ blocks: [CodeBlock(), WitSpaceBlock] }),
    EXPERIMENTAL_TableFeature(),
  ],
})
