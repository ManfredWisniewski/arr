import type { CollectionConfig } from 'payload'

import { authenticated, editorOnly } from '../access/roles'
import { pagesEditor } from '../editor'
import { enforceEditorPublish } from '../hooks/enforceEditorPublish'
import { markdownToContent } from '../hooks/markdownToContent'

// Blog posts synced from <site>/blog/<agent>/*_webtext*.md. Taxonomy
// (author, categories, tags) is plain data owned by the content repo;
// archives are frontend routes under /blog, not `pages` documents.
export const Posts: CollectionConfig = {
  slug: 'posts',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'author', 'publishedAt', 'updatedAt'],
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
      // full public route, e.g. /blog/alisa/seo-grundlagen
      name: 'path',
      type: 'text',
      required: true,
      unique: true,
    },
    {
      name: 'excerpt',
      type: 'textarea',
      localized: true,
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
      // front-matter `date`; drives archive ordering
      name: 'publishedAt',
      type: 'date',
      index: true,
      admin: {
        date: {
          pickerAppearance: 'dayOnly',
        },
      },
    },
    {
      // agent slug; display data lives in the `structures` doc "agents"
      name: 'author',
      type: 'text',
      index: true,
    },
    {
      name: 'categories',
      type: 'text',
      hasMany: true,
    },
    {
      name: 'tags',
      type: 'text',
      hasMany: true,
    },
    {
      name: 'cover',
      type: 'upload',
      relationTo: 'media',
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
