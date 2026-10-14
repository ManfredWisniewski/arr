import { APIError, type CollectionBeforeChangeHook } from 'payload'

// D04 review gate: only editors may publish via the API. Server-side local
// calls (payloadAPI === 'local', e.g. seed scripts) are trusted.
// With localized status (D10) `_status` can arrive as {de, en}; publishing
// in ANY locale requires the editor role.
export const enforceEditorPublish: CollectionBeforeChangeHook = ({
  data,
  req,
}) => {
  const status = data?._status
  const wantsPublish =
    status === 'published' ||
    (typeof status === 'object' &&
      status !== null &&
      Object.values(status).includes('published'))
  if (
    wantsPublish &&
    req.payloadAPI !== 'local' &&
    req.user?.role !== 'editor'
  ) {
    throw new APIError('Only editors can publish.', 403)
  }
  return data
}
