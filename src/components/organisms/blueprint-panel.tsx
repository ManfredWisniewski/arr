import * as React from 'react'

import { cx } from '@/lib/cx'

/** Blueprint graph-paper fill — grid lines follow currentColor at low alpha. */
const gridStyle = (cell: number): React.CSSProperties => ({
  backgroundImage:
    'linear-gradient(to right, color-mix(in srgb, currentColor 12%, transparent) 1px, transparent 1px),' +
    'linear-gradient(to bottom, color-mix(in srgb, currentColor 12%, transparent) 1px, transparent 1px),' +
    'linear-gradient(to right, color-mix(in srgb, currentColor 5%, transparent) 1px, transparent 1px),' +
    'linear-gradient(to bottom, color-mix(in srgb, currentColor 5%, transparent) 1px, transparent 1px)',
  backgroundSize: `${cell * 5}px ${cell * 5}px, ${cell * 5}px ${cell * 5}px, ${cell}px ${cell}px, ${cell}px ${cell}px`,
})

const CornerMark = ({ className }: { className: string }) => (
  <span aria-hidden className={cx('blueprint-mark', className)}>
    +
  </span>
)

export interface BlueprintPanelProps extends React.HTMLAttributes<HTMLElement> {
  /** Figure tag shown in the corner, e.g. "FIG. 03". */
  fig?: string
  /** Minor grid cell in px (major lines every 5 cells). */
  cell?: number
  /** Render the caption inside the flow instead of pinned to the corner. */
  captionBelow?: boolean
}

// Schematic panel — graph paper, registration marks and a figure
// caption (.blueprint* contract classes). Ported from biti trurl/.
export const BlueprintPanel = ({
  captionBelow = false,
  cell = 8,
  children,
  className,
  fig,
  ...props
}: BlueprintPanelProps) => {
  return (
    <figure className={cx('blueprint', className)} style={gridStyle(cell)} {...props}>
      <CornerMark className="blueprint-mark-tl" />
      <CornerMark className="blueprint-mark-tr" />
      <CornerMark className="blueprint-mark-bl" />
      <CornerMark className="blueprint-mark-br" />
      {children}
      {fig ? (
        <figcaption className={cx('blueprint-fig', captionBelow && 'blueprint-fig-inline')}>
          {fig}
        </figcaption>
      ) : null}
    </figure>
  )
}
