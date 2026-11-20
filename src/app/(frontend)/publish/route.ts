import { getPayload } from 'payload'

import config from '@/payload.config'
import {
  docViewPath,
  getPendingDocs,
  REVIEW_COLLECTIONS,
  type ReviewCollection,
} from '@/lib/review'

// POST /publish — confirms the displayed document's latest draft version
// (spec +wit/specs/arr/preview-confirm/, FR-002/FR-003). Session-only:
// the domain-scoped payload-token cookie from the /admin login authorizes
// the request; enforceEditorPublish re-checks the role on the way out.
export async function POST(request: Request) {
  const payload = await getPayload({ config: await config })
  const { user } = await payload.auth({ headers: request.headers })
  if (user?.role !== 'editor') {
    return new Response('Forbidden', { status: 403 })
  }

  const form = await request.formData()
  const collection = String(form.get('collection') ?? '')
  const id = Number(form.get('id'))
  const from = String(form.get('from') ?? '')
  if (
    !REVIEW_COLLECTIONS.includes(collection as ReviewCollection) ||
    !Number.isInteger(id) ||
    id <= 0
  ) {
    return new Response('Bad request', { status: 400 })
  }

  const doc = await payload.update({
    collection: collection as ReviewCollection,
    id,
    data: { _status: 'published' },
    user,
  })

  // Sequential review flow (FR-005): from a pending doc advance to the
  // next viewable pending document; from the index back to the index;
  // otherwise show the just-published page.
  const target =
    from === 'index'
      ? '/review'
      : from === 'review'
        ? await nextReviewHref()
        : docViewPath(collection as ReviewCollection, doc)

  return Response.redirect(new URL(target, request.url), 303)
}

// Next pending doc with an own route; structures are confirmed on /review
// itself, so they redirect back to the index.
const nextReviewHref = async () => {
  const next = (await getPendingDocs()).find(
    (doc) => doc.collection !== 'structures',
  )
  return next ? `${next.viewPath}?from=review` : '/review'
}
