import 'dotenv/config'
import { readdirSync, readFileSync, statSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import yaml from 'js-yaml'
import { getPayload } from 'payload'

import config from '../src/payload.config'

// Pushes tests/assets/demo-content into the local Payload (dev/test use
// only — content lands published so the demo site is browsable without
// review). Mirrors the .arrcontent.yml routing: `blog/**` and
// `*/blog/**` go to posts, everything else to pages; `+structure/*.yml`
// become structure docs; `site.yml` updates the theme global.
// Images are fetched from their hotlinked URLs at push time and uploaded
// to the media collection — nothing binary lives in the repo.

const ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../tests/assets/demo-content',
)
const REPO_ROOT = path.resolve(ROOT, '../../..')
const SOURCE_REPO = 'arr-demo'
const MARKDOWN_IMAGE_RE = /!\[([^\]]*)\]\((https:\/\/w1t\.org\/[^)\s]+)\)/g

type Frontmatter = Record<string, unknown>

function listFiles(dir: string, match: RegExp): string[] {
  const out: string[] = []
  for (const entry of readdirSync(dir)) {
    const full = path.join(dir, entry)
    if (statSync(full).isDirectory()) {
      out.push(...listFiles(full, match))
    } else if (match.test(entry)) {
      out.push(full)
    }
  }
  return out
}

function parseWebtext(file: string): { data: Frontmatter; body: string } {
  const raw = readFileSync(file, 'utf8')
  const fm = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/)
  if (!fm) {
    return { data: {}, body: raw }
  }
  return {
    data: (yaml.load(fm[1]!) as Frontmatter) ?? {},
    body: raw.slice(fm[0].length),
  }
}

function str(value: unknown): string | undefined {
  return typeof value === 'string' ? value : undefined
}

function strArray(value: unknown): string[] | undefined {
  return Array.isArray(value)
    ? value.filter((v): v is string => typeof v === 'string')
    : undefined
}

const payload = await getPayload({ config: await config })

// ---------------------------------------------------------------- media
// Hotlinked `https://w1t.org/...` URLs are resolved upstream through the
// w1t.org media API (sourcePath lookup → /api/media/file/...), fetched
// and uploaded locally with sourcePath = the hotlink URL — so both
// markdown image placeholders and `agents[].avatar`/`site.yml` fields
// resolve through the local media collection.
const W1T_MEDIA_API = 'https://w1t.org/api/media'
const mediaIds = new Map<string, number>()

async function fetchRemote(url: string): Promise<{ buffer: Buffer; mimetype: string; name: string }> {
  const pathname = new URL(url).pathname.replace(/^\//, '')
  const candidates = [pathname, pathname.replace(/^media\//, '')]
  for (const sourcePath of [...new Set(candidates)]) {
    const res = await fetch(
      `${W1T_MEDIA_API}?where[sourcePath][equals]=${encodeURIComponent(sourcePath)}&limit=1`,
    )
    const doc = (await res.json()) as { docs?: { url?: string }[] }
    const fileUrl = doc.docs?.[0]?.url
    if (!fileUrl) {
      continue
    }
    const file = await fetch(`https://w1t.org${fileUrl}`)
    if (!file.ok) {
      throw new Error(`fetch https://w1t.org${fileUrl}: ${file.status}`)
    }
    const buffer = Buffer.from(await file.arrayBuffer())
    return {
      buffer,
      mimetype: file.headers.get('content-type') ?? 'application/octet-stream',
      name: fileUrl.split('/').pop() ?? 'image',
    }
  }
  throw new Error(`no w1t.org media doc for ${url}`)
}

async function ensureMedia(url: string): Promise<number> {
  const cached = mediaIds.get(url)
  if (cached) {
    return cached
  }
  const existing = await payload.find({
    collection: 'media',
    limit: 1,
    where: { sourcePath: { equals: url } },
  })
  if (existing.docs[0]) {
    mediaIds.set(url, existing.docs[0].id as number)
    return existing.docs[0].id as number
  }
  const { buffer, mimetype, name } = await fetchRemote(url)
  const doc = await payload.create({
    collection: 'media',
    data: {
      alt: name.replace(/\.[a-z0-9]+$/i, '').replace(/[-_]/g, ' '),
      sourcePath: url,
      sourceRepo: SOURCE_REPO,
    },
    file: { data: buffer, mimetype, name, size: buffer.length },
  })
  mediaIds.set(url, doc.id as number)
  return doc.id as number
}

async function ensureFont(
  relativePath: string,
  family: string,
  weight: string,
  style: 'italic' | 'normal',
): Promise<string> {
  const sourcePath = relativePath.split(path.sep).join('/')
  const existing = await payload.find({
    collection: 'media',
    limit: 1,
    where: { sourcePath: { equals: sourcePath } },
  })
  let doc = existing.docs[0]
  const filePath = path.join(REPO_ROOT, relativePath)
  const name = path.basename(filePath)
  if (!doc) {
    const byFilename = await payload.find({
      collection: 'media',
      limit: 1,
      where: { filename: { equals: name } },
    })
    doc = byFilename.docs[0]
  }
  if (!doc) {
    const buffer = readFileSync(filePath)
    doc = await payload.create({
      collection: 'media',
      data: {
        alt: `${family} ${weight}`,
        sourcePath,
        sourceRepo: SOURCE_REPO,
      },
      file: { data: buffer, mimetype: 'font/woff2', name, size: buffer.length },
    })
  } else if (doc.sourcePath !== sourcePath) {
    doc = await payload.update({
      collection: 'media',
      id: doc.id,
      data: { alt: `${family} ${weight}`, sourcePath, sourceRepo: SOURCE_REPO },
    })
  }
  const url =
    typeof doc.url === 'string'
      ? doc.url
      : `/api/media/file/${path.basename(relativePath)}`
  return `@font-face{font-family:'${family}';src:url('${url}') format('woff2');font-style:${style};font-weight:${weight};font-display:swap}`
}

async function collectAndUpload(markdown: string): Promise<string> {
  const urls = [...markdown.matchAll(MARKDOWN_IMAGE_RE)]
  for (const [, , url] of urls) {
    await ensureMedia(url!)
  }
  return markdown.replace(
    MARKDOWN_IMAGE_RE,
    (_m, _alt, url) => `![media:${mediaIds.get(url!)}]()`,
  )
}

// ------------------------------------------------------------- upserts
async function upsertByPath(
  collection: 'pages' | 'posts',
  routePath: string,
  data: Record<string, unknown>,
) {
  const existing = await payload.find({
    collection,
    limit: 1,
    where: { path: { equals: routePath } },
  })
  if (existing.docs[0]) {
    await payload.update({
      collection,
      id: existing.docs[0].id,
      data,
      draft: false,
    })
    return 'updated'
  }
  await payload.create({ collection, data: data as never, draft: false })
  return 'created'
}

const counts: Record<string, { created: number; updated: number }> = {}
const bump = (key: string, kind: string) => {
  counts[key] ??= { created: 0, updated: 0 }
  if (kind === 'created') {
    counts[key].created += 1
  } else {
    counts[key].updated += 1
  }
}

// ------------------------------------------------------------ structure
for (const file of listFiles(path.join(ROOT, '+structure'), /\.yml$/)) {
  const name = path.basename(file, '.yml')
  const rel = path.relative(ROOT, file).split(path.sep).join('/')
  const data = yaml.load(readFileSync(file, 'utf8')) as Record<string, unknown>

  // media references inside structures (e.g. agents[].avatar URLs)
  if (name === 'agents' && Array.isArray(data?.agents)) {
    for (const agent of data.agents as { avatar?: string }[]) {
      if (agent.avatar?.startsWith('https://w1t.org/')) {
        await ensureMedia(agent.avatar)
      }
    }
  }

  const existing = await payload.find({
    collection: 'structures',
    limit: 1,
    where: { name: { equals: name } },
  })
  const doc = { name, data, sourcePath: rel, sourceRepo: SOURCE_REPO }
  if (existing.docs[0]) {
    await payload.update({
      collection: 'structures',
      id: existing.docs[0].id,
      data: doc,
      draft: false,
    })
    bump('structures', 'updated')
  } else {
    await payload.create({
      collection: 'structures',
      data: { ...doc, _status: 'published' },
      draft: false,
    })
    bump('structures', 'created')
  }
}

// ---------------------------------------------------------------- theme
const siteFile = path.join(ROOT, 'site.yml')
const site = yaml.load(readFileSync(siteFile, 'utf8')) as Record<string, unknown>
const fontFamilies = [
  { family: 'Inter', prefix: 'inter-v' },
  { family: 'Inter Tight', prefix: 'inter-tight-' },
  { family: 'Roboto', prefix: 'roboto-v' },
  { family: 'Roboto Serif', prefix: 'roboto-serif-' },
]
const fontDirectory = path.join(ROOT, 'assets/fonts')
const fontRules: string[] = []
for (const name of readdirSync(fontDirectory)) {
  const font = fontFamilies.find(({ prefix }) => name.startsWith(prefix))
  const match = name.match(/(?:-(\d{3})(italic)?|-(regular|italic))\.woff2$/)
  if (!font || !match) {
    continue
  }
  const weight = match[1] ?? '400'
  const style = match[2] || match[3] === 'italic' ? 'italic' : 'normal'
  fontRules.push(
    await ensureFont(
      `tests/assets/demo-content/assets/fonts/${name}`,
      font.family,
      weight,
      style,
    ),
  )
}
const cssLight = readFileSync(
  path.join(REPO_ROOT, 'biti/tokens/build/css/wit-light.css'),
  'utf8',
)
const cssDark = readFileSync(
  path.join(REPO_ROOT, 'biti/tokens/build/css/wit-dark.css'),
  'utf8',
)
const fontVariables =
  ":root{--typography-typeface-change-font-here-body:'Roboto Serif';--typography-typeface-change-font-here-display:'Inter';--typography-typeface-change-font-here-heading:'Inter'}"
const theme: Record<string, unknown> = {
  cssDark,
  cssLight: `${cssLight}\n${fontRules.join('\n')}\n${fontVariables}`,
  meta: { siteName: site.site_name, lang: site.lang },
}
for (const field of ['logo', 'favicon'] as const) {
  const url = str(site[field])
  if (url?.startsWith('https://')) {
    theme[field] = await ensureMedia(url)
  }
}
await payload.updateGlobal({ slug: 'theme', data: theme, draft: false })

// ---------------------------------------------------------------- docs
const files = listFiles(ROOT, /^webtext\.md$/).sort()
for (const file of files) {
  const dir = path.dirname(path.relative(ROOT, file))
  const segments = dir === '.' ? [] : dir.split(path.sep)
  const routePath = '/' + segments.join('/')
  const slug = segments.at(-1) ?? 'index'
  const rel = path.relative(ROOT, file).split(path.sep).join('/')
  const { data: fm, body } = parseWebtext(file)
  const markdownRaw = await collectAndUpload(body.trim())

  if (segments[0] === 'blog' || segments[1] === 'blog') {
    const kind = await upsertByPath('posts', routePath, {
      title: str(fm.title) ?? slug,
      slug,
      path: routePath,
      author: str(fm.author),
      publishedAt: str(fm.date),
      categories: strArray(fm.categories),
      tags: strArray(fm.tags),
      excerpt: str(fm.excerpt),
      markdownRaw,
      meta: { description: str(fm.description) },
      sourcePath: rel,
      sourceRepo: SOURCE_REPO,
      _status: 'published',
    })
    bump('posts', kind)
  } else {
    const kind = await upsertByPath('pages', routePath, {
      title: str(fm.title) ?? str(fm.meta_title) ?? slug,
      slug,
      path: routePath,
      markdownRaw,
      template: str(fm.template),
      meta: {
        title: str(fm.meta_title) ?? str(fm.title),
        description: str(fm.meta_description) ?? str(fm.description),
      },
      sourcePath: rel,
      sourceRepo: SOURCE_REPO,
      _status: 'published',
    })
    bump('pages', kind)
  }
}

console.log(
  `demo-content pushed: ${JSON.stringify(counts)}, media ${mediaIds.size} file(s)`,
)
process.exit(0)
