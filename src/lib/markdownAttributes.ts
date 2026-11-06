// Markdown attribute syntax (kramdown/Pandoc style, decision D09):
//
//   ## Title {#some-id}              → heading anchor id
//   [text](url){target="_blank"}     → link target override
//
// Heading anchors exist so internal links like /faq/glossar#headless-cms
// stay stable regardless of heading text; link targets let authors
// override the default policy (absolute http(s) URLs open in a new tab,
// everything else in the same tab — decision D08).
//
// Lexical nodes carry neither attribute natively, so extractHeadingAnchors
// strips `{#id}` before conversion (it must not leak into the visible
// text) and returns the ids in document order; applyHeadingAnchors stamps
// them onto the serialized heading nodes as an extra `id` key.
// applyLinkTargets runs after conversion and works at the node level: a
// `{target="…"}` attribute survives markdown import as an unformatted
// text node directly following its link node — it is stripped from the
// text and stamped onto the link's `fields.target`. This needs no
// fence/code tracking: inside code there are no link nodes, and
// inline-code text carries format != 0. The frontend JSX converters
// render `id` / `target` as the matching element attributes.
//
// Heading ids are matched positionally — the Nth ATX heading in the
// markdown maps to the Nth heading node in the Lexical tree. ATX_HEADING
// mirrors the converter's own heading regex, and lines inside fenced
// code blocks are skipped (Lexical does not create headings there
// either), so the alignment holds.

const ATX_HEADING = /^#{1,6}\s/
const HEADING_ANCHOR = /[ \t]*\{#([a-z0-9][a-z0-9-]*)\}[ \t]*$/
const FENCE = /^[ \t]*(`{3,}|~{3,})/

const LINK_TARGETS = new Set(['_blank', '_self', '_parent', '_top'])
const LINK_TARGET_ATTR =
  /^\{:?target=(?:"([^"]+)"|'([^']+)'|([A-Za-z_][A-Za-z0-9_-]*))\}/
// `](url)` immediately followed by the attribute — used by
// stripMarkdownAttributes for non-Lexical render paths (slide decks).
const LINK_TARGET_INLINE =
  /(\]\([^()\n]*\))\{:?target=(?:"[^"]+"|'[^']+'|[A-Za-z_][A-Za-z0-9_-]*)\}/g

export const extractHeadingAnchors = (
  markdown: string,
): { anchors: (null | string)[]; markdown: string } => {
  const anchors: (null | string)[] = []
  const lines = markdown.split('\n')
  let fence: null | string = null

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i] ?? ''
    const fenceMatch = FENCE.exec(line)
    if (fenceMatch) {
      const marker = fenceMatch[1]![0]!
      fence = fence === marker ? null : (fence ?? marker)
      continue
    }
    if (fence || !ATX_HEADING.test(line)) {
      continue
    }
    const anchor = HEADING_ANCHOR.exec(line)
    const stripped = anchor ? line.replace(HEADING_ANCHOR, '') : line
    // only accept the anchor when heading text remains — `## {#id}` alone
    // would degrade to a non-heading line and break the positional mapping
    if (anchor && /\S/.test(stripped.replace(/^#{1,6}/, ''))) {
      lines[i] = stripped
      anchors.push(anchor[1]!)
    } else {
      anchors.push(null)
    }
  }

  return { anchors, markdown: lines.join('\n') }
}

type SerializedNode = { children?: SerializedNode[]; type?: string } & Record<
  string,
  unknown
>

export const applyHeadingAnchors = (
  editorState: { root?: { children?: SerializedNode[] } },
  anchors: (null | string)[],
): void => {
  let index = 0
  const walk = (nodes: SerializedNode[] | undefined) => {
    for (const node of nodes ?? []) {
      if (node.type === 'heading') {
        const id = anchors[index]
        if (id) {
          node.id = id
        }
        index++
      }
      walk(node.children)
    }
  }
  walk(editorState.root?.children)
}

// Stamps `fields.target` on link/autolink nodes followed by an
// unformatted `{target="…"}` text node and removes the attribute from the
// text. Only the four browsing-context keywords are consumed — anything
// else stays literal so a typo is visible in the draft preview.
export const applyLinkTargets = (editorState: {
  root?: { children?: SerializedNode[] }
}): void => {
  const walk = (nodes: SerializedNode[] | undefined) => {
    for (let i = 0; i < (nodes?.length ?? 0); i++) {
      const node = nodes![i]!
      if (node.type === 'link' || node.type === 'autolink') {
        const next = nodes![i + 1]
        const text = typeof next?.text === 'string' ? next.text : ''
        const match =
          next?.type === 'text' && next.format === 0
            ? LINK_TARGET_ATTR.exec(text)
            : null
        const target = match?.[1] ?? match?.[2] ?? match?.[3]
        if (match && target && LINK_TARGETS.has(target)) {
          ;(next as { text: string }).text = text.slice(match[0].length)
          if (next.text === '') {
            nodes!.splice(i + 1, 1)
          }
          node.fields = {
            ...(node.fields as Record<string, unknown> | undefined),
            target,
          }
        }
      }
      walk(node.children)
    }
  }
  walk(editorState.root?.children)
}

// Strips attribute markup for render paths that do not go through Lexical
// (reveal.js slide decks render their own anchors — targets can't apply,
// so the markup is removed instead of leaking into the slide text).
export const stripMarkdownAttributes = (markdown: string): string => {
  const { markdown: stripped } = extractHeadingAnchors(markdown)
  const lines = stripped.split('\n')
  let fence: null | string = null
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i] ?? ''
    const fenceMatch = FENCE.exec(line)
    if (fenceMatch) {
      const marker = fenceMatch[1]![0]!
      fence = fence === marker ? null : (fence ?? marker)
      continue
    }
    if (!fence) {
      lines[i] = line.replace(LINK_TARGET_INLINE, '$1')
    }
  }
  return lines.join('\n')
}
