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
      localized: true,
      required: true,
    },
    {
      name: 'caption',
      type: 'text',
      localized: true,
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
  // Variants generated at upload so no render path ships full-size
  // originals: `logo` for header/footer marks, `avatar` for sm/lg
  // bylines + wit-space cards, `card` for post-card media, `content`
  // for figures/steps in page bodies, `hero` for page/lead heroes.
  upload: {
    imageSizes: [
      { name: 'logo', width: 256, withoutEnlargement: true },
      { name: 'avatar', height: 128, position: 'centre', width: 128 },
      { name: 'card', width: 640, withoutEnlargement: true },
      { name: 'content', width: 960, withoutEnlargement: true },
      { name: 'hero', width: 1920, withoutEnlargement: true },
    ],
  },
}
