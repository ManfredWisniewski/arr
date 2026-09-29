import type { CollectionConfig } from 'payload'

import { authenticated, editorOnly } from '../access/roles'

export const Media: CollectionConfig = {
  slug: 'media',
  access: {
    read: () => true,
    create: authenticated,
    update: authenticated,
    delete: editorOnly,
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
    },
    {
      name: 'caption',
      type: 'text',
    },
    {
      // sha256 of the uploaded file, set by the sync tool for dedup
      name: 'sourceHash',
      type: 'text',
      index: true,
    },
    {
      // path of the file inside the content repository
      name: 'sourcePath',
      type: 'text',
      index: true,
    },
  ],
  upload: true,
}
