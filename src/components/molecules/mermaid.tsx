'use client'

import React from 'react'

// ```mermaid fenced blocks arrive as <pre><code class="language-mermaid">;
// swap them for mermaid's own nodes and render. A root that already is
// <pre class="mermaid"> is rendered directly. Failures keep the source
// block visible.
export const renderMermaid = async (root: HTMLElement) => {
  const nodes: HTMLElement[] = []
  root
    .querySelectorAll<HTMLElement>(
      'pre > code[class*="mermaid"], pre[class*="mermaid"]:not([data-processed])',
    )
    .forEach((node) => {
      const code =
        node.tagName === 'CODE' ? node : node.querySelector('code') ?? node
      const pre = document.createElement('pre')
      pre.className = 'mermaid'
      pre.textContent = code.textContent ?? ''
      code.parentElement?.replaceWith(pre)
      nodes.push(pre)
    })
  if (root.matches('pre.mermaid')) {
    nodes.push(root)
  }
  if (!nodes.length) {
    return
  }
  try {
    const mod = (await import('mermaid')) as unknown as {
      default?: typeof import('mermaid').default
    }
    const mermaid = mod.default ??
      (mod as unknown as typeof import('mermaid').default)
    mermaid.initialize({ startOnLoad: false })
    // nodes inside display:none parents can't be measured — the render
    // produces a degenerate svg (collapsed foreignObjects, tiny viewBox).
    // visibility:hidden still has layout, so render in an offscreen
    // wrapper and move the nodes back afterwards
    const probe = document.createElement('div')
    probe.setAttribute(
      'style',
      'position:fixed;left:-99999px;top:0;visibility:hidden',
    )
    document.body.appendChild(probe)
    const homes = nodes.map((n) => ({
      next: n.nextSibling,
      node: n,
      parent: n.parentNode,
    }))
    nodes.forEach((n) => probe.appendChild(n))
    try {
      await mermaid.run({ nodes })
    } finally {
      homes.forEach(({ next, node, parent }) =>
        parent?.insertBefore(node, next),
      )
      probe.remove()
    }
  } catch (error) {
    // leave whatever mermaid rendered (error svg or source text) in place
    console.error('mermaid render failed', error)
  }
}

export const MermaidDiagram = ({
  className,
  diagram,
}: {
  className?: string
  diagram: string
}) => {
  const ref = React.useRef<HTMLPreElement>(null)

  React.useEffect(() => {
    if (ref.current) {
      void renderMermaid(ref.current)
    }
  }, [diagram])

  return (
    <pre
      className={className ? `mermaid ${className}` : 'mermaid'}
      ref={ref}
    >
      {diagram}
    </pre>
  )
}
