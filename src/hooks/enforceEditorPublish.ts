import { APIError, type CollectionBeforeChangeHook } from 'payload'

// D04 review gate: only editors may publish via the API. Server-side local
// calls (payloadAPI === 'local', e.g. seed scripts) are trusted.
export const enforceEditorPublish: CollectionBeforeChangeHook = ({
  data,
  req,
}) => {
  if (
    data?._status === 'published' &&
    req.payloadAPI !== 'local' &&
    req.user?.role !== 'editor'
  ) {
    throw new APIError('Only editors can publish.', 403)
  }
  return data
}
