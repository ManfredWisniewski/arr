import type { CollectionConfig } from 'payload'

import { authenticated, editorOnly } from '../../../access/roles'

// T011 — private upload collection for applicant files (spec
// +wit/specs/arr/jobs/, FR-010/FR-011, NFR-002/NFR-003). Unlike `media`
// these files are personal data: reads require a session, public create
// is closed — only the apply endpoint writes (local API).
export const JobAttachments: CollectionConfig = {
  slug: 'job-attachments',
  access: {
    read: authenticated,
    create: () => false,
    update: authenticated,
    delete: editorOnly,
  },
  fields: [
    {
      name: 'kind',
      type: 'text',
      admin: {
        readOnly: true,
      },
    },
  ],
  upload: true,
}
