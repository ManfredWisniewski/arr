import type { CollectionConfig } from 'payload'

import { editorOnly } from '../access/roles'

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
  },
  auth: {
    useAPIKey: {
      // lets an admin reveal the stored key instead of regenerating
      reveal: true,
    },
  },
  access: {
    // No access block defaults to "any authenticated user can CRUD users",
    // which would let the content-bot API key self-promote to editor.
    // unlock must be listed: its Payload default admits any users member.
    create: editorOnly,
    read: editorOnly,
    update: editorOnly,
    delete: editorOnly,
    unlock: editorOnly,
  },
  hooks: {
    // LockedAuth is only reachable for registered emails, so its distinct
    // message would enumerate accounts; return the generic failure instead.
    afterError: [
      async ({ error, req, result }) => {
        if (error?.name === 'LockedAuth') {
          return {
            status: 401,
            response: {
              errors: [
                {
                  message: req.t
                    ? req.t('error:emailOrPasswordIncorrect')
                    : 'The email or password provided is incorrect.',
                },
              ],
            },
          }
        }
        return { response: result }
      },
    ],
  },
  fields: [
    // Email added by default
    {
      name: 'role',
      type: 'select',
      required: true,
      defaultValue: 'editor',
      saveToJWT: true,
      options: [
        { label: 'Editor', value: 'editor' },
        { label: 'Content bot', value: 'content-bot' },
      ],
    },
  ],
}
