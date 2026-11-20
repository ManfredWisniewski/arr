import { APIError, type CollectionBeforeChangeHook } from 'payload'

// D04 review gate: only editors may change publication state via the API.
// Server-side local calls (payloadAPI === 'local', e.g. seed scripts) are
// trusted. The check is two-directional: a non-editor may neither publish
// nor demote a published document back to draft. With localized status
// (D10) `_status` can arrive as {de, en}; publishing in ANY locale
// requires the editor role.
export const enforceEditorPublish: CollectionBeforeChangeHook = ({
  data,
  originalDoc,
  req,
}) => {
  if (req.payloadAPI === 'local' || req.user?.role === 'editor') {
    return data
  }
  const anyPublished = (status: unknown) =>
    status === 'published' ||
    (typeof status === 'object' &&
      status !== null &&
      Object.values(status).includes('published'))
  if (anyPublished(data?._status)) {
    throw new APIError('Only editors can publish.', 403)
  }
  if (!anyPublished(data?._status) && anyPublished(originalDoc?._status)) {
    throw new APIError('Only editors can unpublish.', 403)
  }
  return data
}
