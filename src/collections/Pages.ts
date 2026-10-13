import type { CollectionConfig } from 'payload'

import { authenticated, editorOnly } from '../access/roles'
import { pagesEditor } from '../editor'
import { enforceEditorPublish } from '../hooks/enforceEditorPublish'
import { markdownToContent } from '../hooks/markdownToContent'

export const Pages: CollectionConfig = {
  slug: 'pages',
  admin: {
    useAsTitle: 'title',
    // opens the frontend draft preview (Draft Mode via /preview route
    // handler); `req.locale` is the locale being edited in the admin —
    // the frontend URL carries it as the /de|/en prefix
    preview: (doc, { req }) =>
      `${req.origin}/preview?secret=${process.env.PREVIEW_SECRET}&path=${encodeURIComponent(`/${req.locale ?? 'de'}${doc.path ?? ''}`)}`,
  },
  versions: {
    drafts: {
      // D10: de/en publish independently
      localizeStatus: true,
    },
  },
  access: {
    read: () => true,
    create: authenticated,
    update: authenticated,
    delete: editorOnly,
  },
  hooks: {
    beforeValidate: [markdownToContent],
    beforeChange: [enforceEditorPublish],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      localized: true,
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
    },
    {
      // full public route, e.g. /online-marketing/seo-agentur
      name: 'path',
      type: 'text',
      required: true,
      unique: true,
    },
    {
      // markdown as pushed by the sync tool; converted to `content` on write
      name: 'markdownRaw',
      type: 'textarea',
      localized: true,
    },
    {
      name: 'content',
      type: 'richText',
      editor: pagesEditor,
      localized: true,
    },
    {
      // repository-relative path of the source file; upsert idempotency key
      name: 'sourcePath',
      type: 'text',
      unique: true,
      index: true,
    },
    {
      name: 'sourceRepo',
      type: 'text',
    },
    {
      // render template name resolved by the frontend registry; empty = default
      name: 'template',
      type: 'text',
    },
    {
      name: 'meta',
      type: 'group',
      localized: true,
      fields: [
        {
          name: 'title',
          type: 'text',
        },
        {
          name: 'description',
          type: 'textarea',
        },
      ],
    },
  ],
}
