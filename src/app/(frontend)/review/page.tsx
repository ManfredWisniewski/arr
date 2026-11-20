import Link from 'next/link'
import { notFound } from 'next/navigation.js'
import React from 'react'

import { getPendingDocs, getViewer, isEditor } from '@/lib/review'

export const metadata = { title: 'Review' }

const COLLECTION_LABELS: Record<string, string> = {
  pages: 'Seite',
  posts: 'Beitrag',
  structures: 'Struktur',
}

// GET /review — editor-only index of every document whose latest version
// is a draft (spec +wit/specs/arr/preview-confirm/, FR-004). Each row
// links to the document's draft view and carries its own publish form —
// per-document confirmation only, no batch action (NFR-001). Non-editors
// get a 404 so the route's existence isn't advertised.
export default async function ReviewPage() {
  const user = await getViewer()
  if (!isEditor(user)) {
    notFound()
  }
  const pending = await getPendingDocs()

  return (
    <div className="page review">
      <h1>Entwürfe zur Prüfung</h1>
      {pending.length === 0 ? (
        <p>Nichts zu prüfen — alle Inhalte sind veröffentlicht.</p>
      ) : (
        <ul className="review-list">
          {pending.map((doc) => (
            <li
              className="review-item"
              key={`${doc.collection}-${doc.id}`}
            >
              <span className="review-collection">
                {COLLECTION_LABELS[doc.collection] ?? doc.collection}
              </span>
              <Link href={`${doc.viewPath}?from=review`}>
                {doc.label}
              </Link>
              {doc.updatedAt ? (
                <time dateTime={doc.updatedAt}>
                  {new Date(doc.updatedAt).toLocaleString('de')}
                </time>
              ) : null}
              <form
                action="/publish"
                className="review-publish"
                method="post"
              >
                <input
                  name="collection"
                  type="hidden"
                  value={doc.collection}
                />
                <input name="id" type="hidden" value={doc.id} />
                <input name="from" type="hidden" value="index" />
                <button type="submit">Veröffentlichen</button>
              </form>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
