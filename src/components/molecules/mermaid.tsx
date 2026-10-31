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
    await mermaid.run({ nodes })
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
