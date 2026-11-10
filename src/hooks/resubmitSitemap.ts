import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
} from 'payload'

import { scheduleSitemapSubmit } from '../lib/searchConsole'

// Notify Google Search Console when the sitemap may have changed — any
// write touching a document that is or was published (publish,
// unpublish, path change, edit of a live doc). Draft-only writes are
// skipped: drafts never appear in the sitemap. The submit itself is
// debounced and fire-and-forget in lib/searchConsole.ts.
const touchesPublished = (
  doc: { _status?: string } | undefined,
  previousDoc: { _status?: string } | undefined,
) => doc?._status === 'published' || previousDoc?._status === 'published'

// The submitted URL must be the public sitemap — the container's
// request origin can be an internal listen address.
const publicOrigin = (req: { origin?: string }) =>
  process.env.NEXT_PUBLIC_SERVER_URL ??
  process.env.SITE_URL ??
  req.origin ??
  ''

export const resubmitSitemapAfterChange: CollectionAfterChangeHook = ({
  doc,
  previousDoc,
  req,
}) => {
  if (touchesPublished(doc, previousDoc)) {
    scheduleSitemapSubmit(publicOrigin(req))
  }
  return doc
}

export const resubmitSitemapAfterDelete: CollectionAfterDeleteHook = ({
  doc,
  req,
}) => {
  if (touchesPublished(doc, undefined)) {
    scheduleSitemapSubmit(publicOrigin(req))
  }
  return doc
}
