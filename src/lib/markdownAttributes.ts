// Markdown attribute syntax (kramdown/Pandoc style, decision D09):
//
//   ## Title {#some-id}              → heading anchor id
//   [text](url){target="_blank"}     → link target override
//   [text](url){preview}             → hover preview fetched from the
//                                      linked doc (fragment → its heading
//                                      section, else meta description)
//   [text](url){preview="Kurztext"}  → hover preview with literal text
//
// Heading anchors exist so internal links like /faq/glossar#headless-cms
// stay stable regardless of heading text; link targets let authors
// override the default policy (absolute http(s) URLs open in a new tab,
// everything else in the same tab — decision D08). Link previews render
// the link inside a RichTooltip on the frontend (jsx-converters link).
//
// Lexical nodes carry neither attribute natively, so extractHeadingAnchors
// strips `{#id}` before conversion (it must not leak into the visible
// text) and returns the ids in document order; applyHeadingAnchors stamps
// them onto the serialized heading nodes as an extra `id` key.
// applyLinkAttributes runs after conversion and works at the node level: a
// `{target="…"}`/`{preview…}` attribute survives markdown import as an
// unformatted text node directly following its link node — it is stripped
// from the text and stamped onto the link's `fields` (`target`/`preview`).
// Several attributes may chain (`{preview}{target="_blank"}`). This needs
// no fence/code tracking: inside code there are no link nodes, and
// inline-code text carries format != 0. The frontend JSX converters
// render `id` / `target` as the matching element attributes and `preview`
// as a RichTooltip.
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
const LINK_PREVIEW_ATTR =
  /^\{:?preview(?:=(?:"([^"]*)"|'([^']*)'|([A-Za-z_][A-Za-z0-9_-]*)))?\}/
// `](url)` immediately followed by attributes — used by
// stripMarkdownAttributes for non-Lexical render paths (slide decks).
const LINK_ATTRS_INLINE =
  /(\]\([^()\n]*\))(?:\{:?(?:target=(?:"[^"]+"|'[^']+'|[A-Za-z_][A-Za-z0-9_-]*)|preview(?:=(?:"[^"]*"|'[^']*'|[A-Za-z_][A-Za-z0-9_-]*))?)\})+/g

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

// Stamps link/autolink `fields` from unformatted attribute text nodes
// directly following the node and removes the consumed markup.
// `{target="…"}` only accepts the four browsing-context keywords;
// `{preview}` stamps `true`, `{preview="…"}` the literal text — anything
// else stays literal so a typo is visible in the draft preview.
export const applyLinkAttributes = (editorState: {
  root?: { children?: SerializedNode[] }
}): void => {
  const walk = (nodes: SerializedNode[] | undefined) => {
    for (let i = 0; i < (nodes?.length ?? 0); i++) {
      const node = nodes![i]!
      if (node.type === 'link' || node.type === 'autolink') {
        const next = nodes![i + 1]
        if (next?.type !== 'text' || next.format !== 0) {
          walk(node.children)
          continue
        }
        let text = typeof next.text === 'string' ? next.text : ''
        const fields = {
          ...(node.fields as Record<string, unknown> | undefined),
        }
        let consumed = false
        for (;;) {
          const targetMatch = LINK_TARGET_ATTR.exec(text)
          const target =
            targetMatch?.[1] ?? targetMatch?.[2] ?? targetMatch?.[3]
          if (targetMatch && target && LINK_TARGETS.has(target)) {
            fields.target = target
            text = text.slice(targetMatch[0].length)
            consumed = true
            continue
          }
          const previewMatch = LINK_PREVIEW_ATTR.exec(text)
          if (previewMatch) {
            fields.preview =
              (previewMatch[1] ?? previewMatch[2] ?? previewMatch[3]) ||
              true
            text = text.slice(previewMatch[0].length)
            consumed = true
            continue
          }
          break
        }
        if (consumed) {
          ;(next as { text: string }).text = text
          if (text === '') {
            nodes!.splice(i + 1, 1)
          }
          node.fields = fields
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
      lines[i] = line.replace(LINK_ATTRS_INLINE, '$1')
    }
  }
  return lines.join('\n')
}
