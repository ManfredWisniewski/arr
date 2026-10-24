import { APIError, type GlobalConfig } from 'payload'

import { editorOrBot } from '../access/roles'

// CSS never legitimately contains a closing tag; rejecting `</` here blocks
// the </style><script> breakout on the public render path.
const rejectMarkup = (value: unknown, name: string) => {
  if (typeof value === 'string' && value.includes('</')) {
    throw new APIError(`${name} must not contain markup`, 400)
  }
}

// Site styling as data: the compiled CSS from wit-tokens is pushed here via
// the API; the frontend injects it verbatim (selectors like `:root` and
// `[data-theme="dark"]` are part of the compiled output).
export const Theme: GlobalConfig = {
  slug: 'theme',
  access: {
    read: () => true,
    update: editorOrBot,
  },
  hooks: {
    beforeValidate: [
      ({ data }) => {
        rejectMarkup(data?.cssLight, 'cssLight')
        rejectMarkup(data?.cssDark, 'cssDark')
        return data
      },
    ],
  },
  fields: [
    {
      // brand mark rendered in the site header; falls back to meta.siteName
      name: 'logo',
      type: 'upload',
      relationTo: 'media',
    },
    {
      // browser tab icon; rendered as <link rel="icon"> when set
      name: 'favicon',
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
