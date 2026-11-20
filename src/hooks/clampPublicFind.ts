import type { CollectionBeforeOperationHook } from 'payload'

// Payload has no maxLimit: anonymous callers could otherwise pass
// limit=0/pagination=false and read whole collections in one request, or
// draft=true to scan the much larger versions tables. Cap pagination for
// unauthenticated REST/GraphQL finds. Local API calls (payloadAPI ===
// 'local') and authenticated users keep full flexibility.
const ANON_MAX_LIMIT = 50

export const clampPublicFind: CollectionBeforeOperationHook = ({
  args,
  operation,
  req,
}) => {
  if (operation !== 'read' || req.user || req.payloadAPI === 'local') {
    return args
  }
  const a = args as {
    draft?: boolean
    limit?: number
    pagination?: boolean
  }
  a.pagination = true
  if (typeof a.limit !== 'number' || a.limit <= 0 || a.limit > ANON_MAX_LIMIT) {
    a.limit = ANON_MAX_LIMIT
  }
  a.draft = false
  return args
}
