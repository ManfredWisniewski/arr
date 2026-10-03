import type { GlobalConfig } from 'payload'

import { editorOrBot } from '../access/roles'

// Site styling as data: the compiled CSS from wit-tokens is pushed here via
// the API; the frontend injects it verbatim (selectors like `:root` and
// `[data-theme="dark"]` are part of the compiled output).
export const Theme: GlobalConfig = {
  slug: 'theme',
  access: {
    read: () => true,
    update: editorOrBot,
  },
  fields: [
    {
      // brand mark rendered in the site header; falls back to meta.siteName
      name: 'logo',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'cssLight',
      type: 'code',
      admin: {
        language: 'css',
      },
    },
    {
      name: 'cssDark',
      type: 'code',
      admin: {
        language: 'css',
      },
    },
    {
      name: 'meta',
      type: 'group',
      fields: [
        {
          name: 'siteName',
          type: 'text',
        },
        {
          name: 'fontFamily',
          type: 'text',
        },
      ],
    },
  ],
}
