import { getViewer, isEditor, type ReviewCollection } from '@/lib/review'

// Floating "not live" signal + confirm action (spec
// +wit/specs/arr/preview-confirm/, FR-001). Renders only when the served
// document's latest version is a draft AND the requester holds an editor
// session — keyed on document state, not the Draft Mode cookie, so it
// also covers authenticated browsing where drafts are served directly.
// Anonymous and non-editor requests get no markup (NFR-003).
export async function DraftBanner({
  collection,
  doc,
  from,
}: {
  collection: ReviewCollection
  doc: { _status?: null | string; id: number }
  from?: string
}) {
  if (doc?._status !== 'draft') {
    return null
  }
  const user = await getViewer()
  if (!isEditor(user)) {
    return null
  }
  return (
    <div className="draft-banner" role="status">
      <span className="draft-banner__label">
        Entwurf — noch nicht veröffentlicht
      </span>
      <form action="/publish" className="draft-banner__form" method="post">
        <input name="collection" type="hidden" value={collection} />
        <input name="id" type="hidden" value={doc.id} />
        {from === 'review' ? (
          <input name="from" type="hidden" value="review" />
        ) : null}
        <button type="submit">Veröffentlichen</button>
      </form>
    </div>
  )
}
