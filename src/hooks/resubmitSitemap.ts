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

export const resubmitSitemapAfterChange: CollectionAfterChangeHook = ({
  doc,
  previousDoc,
  req,
}) => {
  if (touchesPublished(doc, previousDoc)) {
    scheduleSitemapSubmit(process.env.SITE_URL ?? req.origin ?? '')
  }
  return doc
}

export const resubmitSitemapAfterDelete: CollectionAfterDeleteHook = ({
  doc,
  req,
}) => {
  if (touchesPublished(doc, undefined)) {
    scheduleSitemapSubmit(process.env.SITE_URL ?? req.origin ?? '')
  }
  return doc
}
