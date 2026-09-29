import type { CollectionConfig } from 'payload'

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
