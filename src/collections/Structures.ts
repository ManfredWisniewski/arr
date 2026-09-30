import type { CollectionConfig } from 'payload'

import { authenticated, editorOnly } from '../access/roles'
import { enforceEditorPublish } from '../hooks/enforceEditorPublish'

// Non-page site structure data (navigation, footer, header, …) pushed by the
// sync tool from <site>/structure/*.yml. `name` is the file stem and `data`
// holds the parsed YAML verbatim — the frontend interprets known names.
export const Structures: CollectionConfig = {
  slug: 'structures',
  admin: {
    useAsTitle: 'name',
  },
  versions: {
    drafts: true,
  },
  access: {
    read: () => true,
    create: authenticated,
    update: authenticated,
    delete: editorOnly,
  },
  hooks: {
    beforeChange: [enforceEditorPublish],
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      unique: true,
      index: true,
    },
    {
      name: 'data',
      type: 'json',
      required: true,
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
  ],
}
