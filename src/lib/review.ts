import { draftMode, headers } from 'next/headers'
import { getPayload, type TypedUser, type Where } from 'payload'

import type { Job, Page, Post, Structure } from '@/payload-types'
import config from '@/payload.config'

// Shared queries for the preview-confirm flow (spec
// +wit/specs/arr/preview-confirm/): session detection, draft-context
// resolution and the pending-review set.
export const REVIEW_COLLECTIONS = [
  'pages',
  'posts',
  'structures',
  'jobs',
] as const
export type ReviewCollection = (typeof REVIEW_COLLECTIONS)[number]

const getReviewPayload = async () => getPayload({ config: await config })

// The Payload session user of the current request, or null. The
// payload-token cookie is domain-scoped, so an /admin login authenticates
// frontend requests too.
export async function getViewer(): Promise<null | TypedUser> {
  // headers() before getPayload: during `next build` prerender it suspends
  // the render (bailout → dynamic route), so Payload init is never reached
  // without env; at request time it resolves instantly.
  const reqHeaders = await headers()
  const payload = await getReviewPayload()
  const { user } = await payload.auth({ headers: reqHeaders })
  return user
}

export const isEditor = (user: null | TypedUser | undefined) =>
  user?.role === 'editor'

// Draft reads are served in Next Draft Mode (/preview entry) and to any
// authenticated session — mirrors publishedOrAuthenticated: a logged-in
// reviewer always sees the latest version, so the draft banner can signal
// pending content without a Draft Mode cookie.
export async function getRequestDraft(): Promise<boolean> {
  const { isEnabled } = await draftMode()
  if (isEnabled) {
    return true
  }
  return Boolean(await getViewer())
}

export type PendingDoc = {
  collection: ReviewCollection
  id: number
  label: string
  updatedAt?: string
  // frontend URL where the draft version is visible to a reviewer
  viewPath: string
}

// The public URL a pending document's latest version is reviewed at.
// structures have no own route — their data renders inside pages
// (navigation/footer), so the representative draft view is the home page.
export const docViewPath = (
  collection: ReviewCollection,
  doc: Job | Page | Post | Structure,
): string =>
  collection !== 'structures' && 'path' in doc && doc.path
    ? doc.path
    : '/'

// All documents whose latest version is a draft — the /review pending
// set. `_status` is resolved against the latest version when draft=true.
export async function getPendingDocs(): Promise<PendingDoc[]> {
  const payload = await getReviewPayload()
  const where: Where = { _status: { equals: 'draft' } }
  const pending: PendingDoc[] = []
  for (const collection of REVIEW_COLLECTIONS) {
    const { docs } = await payload.find({
      collection,
      draft: true,
      limit: 0,
      where,
    })
    for (const doc of docs as (Job | Page | Post | Structure)[]) {
      pending.push({
        collection,
        id: doc.id,
        label:
          'title' in doc && typeof doc.title === 'string'
            ? doc.title
            : 'name' in doc && typeof doc.name === 'string'
              ? doc.name
              : String(doc.id),
        updatedAt: doc.updatedAt,
        viewPath: docViewPath(collection, doc),
      })
    }
  }
  return pending.sort((a, b) =>
    (b.updatedAt ?? '').localeCompare(a.updatedAt ?? ''),
  )
}
