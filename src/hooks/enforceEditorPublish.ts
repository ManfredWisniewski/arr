import { APIError, type CollectionBeforeChangeHook } from 'payload'

// D04 review gate: only editors may change publication state via the API.
// Server-side local calls (payloadAPI === 'local', e.g. seed scripts) are
// trusted. The check is two-directional: a non-editor may neither publish
// nor demote a published document back to draft.
export const enforceEditorPublish: CollectionBeforeChangeHook = ({
  data,
  originalDoc,
  req,
}) => {
  if (req.payloadAPI === 'local' || req.user?.role === 'editor') {
    return data
  }
  if (data?._status === 'published') {
    throw new APIError('Only editors can publish.', 403)
  }
  if (
    data?._status === 'draft' &&
    originalDoc?._status === 'published'
  ) {
    throw new APIError('Only editors can unpublish.', 403)
  }
  return data
}
