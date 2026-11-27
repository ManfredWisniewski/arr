import type { CollectionConfig } from 'payload'

import { authenticated, editorOnly } from '../../../access/roles'

// T012 — application records (spec +wit/specs/arr/jobs/, FR-010,
// NFR-002). Runtime data owned by the CMS — the declared exception to the
// read-model principle. Public create stays closed; only the apply
// endpoint writes via the local API.
export const JobApplications: CollectionConfig = {
  slug: 'job-applications',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'email', 'job', 'createdAt'],
  },
  access: {
    read: authenticated,
    create: () => false,
    update: authenticated,
    delete: editorOnly,
  },
  fields: [
    {
      name: 'job',
      type: 'relationship',
      relationTo: 'jobs',
      required: true,
      index: true,
    },
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'email',
      type: 'email',
      required: true,
    },
    {
      name: 'phone',
      type: 'text',
    },
    {
      name: 'message',
      type: 'textarea',
    },
    {
      name: 'cv',
      type: 'upload',
      relationTo: 'job-attachments',
    },
  ],
}
