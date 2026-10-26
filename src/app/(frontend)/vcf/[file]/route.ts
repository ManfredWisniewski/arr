import { readFile } from 'fs/promises'
import path from 'path'

import { getPayload } from 'payload'

import config from '@/payload.config'

// /<name>.vcf at the domain root is rewritten here by next.config
// (see rewrites). Resolved via the content-repo sourcePath so a
// re-uploaded file is served even when Payload dedupes the stored
// filename (name-1.vcf, ...) — the newest doc wins.
const SOURCE_REPO = 'witconsult.de'

type Props = {
  params: Promise<{ file: string }>
}

export async function GET(_request: Request, { params }: Props) {
  const { file } = await params
  const payload = await getPayload({ config: await config })
  const { docs } = await payload.find({
    collection: 'media',
    limit: 1,
    sort: '-updatedAt',
    where: {
      sourcePath: { equals: `media/${file}` },
      sourceRepo: { equals: SOURCE_REPO },
    },
  })
  const doc = docs[0]
  if (!doc?.filename) {
    return new Response('Not Found', { status: 404 })
  }
  const staticDir = payload.collections.media.config.upload.staticDir ?? 'media'
  try {
    const body = await readFile(path.resolve(staticDir, doc.filename))
    return new Response(body, {
      headers: {
        'Content-Disposition': `attachment; filename="${file.replace(/["\\]/g, '')}"`,
        'Content-Type': doc.mimeType ?? 'application/octet-stream',
      },
    })
  } catch {
    return new Response('Not Found', { status: 404 })
  }
}

export const HEAD = GET
