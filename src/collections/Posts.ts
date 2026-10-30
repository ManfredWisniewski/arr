import type { CollectionConfig } from 'payload'

import {
  authenticated,
  editorOnly,
  publishedOrAuthenticated,
} from '../access/roles'
import { pagesEditor } from '../editor'
import { clampPublicFind } from '../hooks/clampPublicFind'
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
      `${req.origin}/preview?secret=${process.env.PREVIEW_SECRET}&path=${encodeURIComponent(String(doc.path ?? ''))}`,
  },
  versions: {
    drafts: true,
  },
  access: {
    read: publishedOrAuthenticated,
    create: authenticated,
    update: authenticated,
    delete: editorOnly,
  },
  hooks: {
    beforeOperation: [clampPublicFind],
    beforeValidate: [markdownToContent],
    beforeChange: [enforceEditorPublish],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
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
      validate: (value: unknown) =>
        typeof value === 'string' && /^[^\s<>&"']+$/.test(value)
          ? true
          : 'Path must not contain whitespace or markup characters',
    },
    {
      name: 'excerpt',
      type: 'textarea',
    },
    {
      // markdown as pushed by the sync tool; converted to `content` on write
      name: 'markdownRaw',
      type: 'textarea',
    },
    {
      name: 'content',
      type: 'richText',
      editor: pagesEditor,
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
      validate: (value: unknown) =>
        value == null ||
        (typeof value === 'string' && /^[^\s<>&"']+$/.test(value))
          ? true
          : 'Author must not contain whitespace or markup characters',
    },
    {
      name: 'categories',
      type: 'text',
      hasMany: true,
      validate: (value: unknown) =>
        value == null ||
        (Array.isArray(value) &&
          value.every(
            (v) => typeof v === 'string' && /^[^\s<>&"']+$/.test(v),
          ))
          ? true
          : 'Categories must not contain whitespace or markup characters',
    },
    {
      name: 'tags',
      type: 'text',
      hasMany: true,
      validate: (value: unknown) =>
        value == null ||
        (Array.isArray(value) &&
          value.every(
            (v) => typeof v === 'string' && /^[^\s<>&"']+$/.test(v),
          ))
          ? true
          : 'Tags must not contain whitespace or markup characters',
    },
    {
      name: 'cover',
      type: 'upload',
      relationTo: 'media',
    },
    {
      // render template name resolved by the frontend registry; empty = default
      name: 'template',
      type: 'text',
    },
    {
      // HedgeDoc `slideOptions` front matter, verbatim — reveal.js config
      // consumed by the `slide` template (theme, transition, width, ...)
      name: 'slideOptions',
      type: 'json',
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
