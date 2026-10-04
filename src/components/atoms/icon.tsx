import React from 'react'

import { cx } from '@/lib/cx'

const paths = {
  check: <path d="M3 8.5l3.5 3.5 6.5-8" />,
  close: <path d="M4 4l8 8M12 4l-8 8" />,
  external: <path d="M6.5 3.5H3.5v9h9V9.5M9 3h4v4M12.5 3.5L8 8" />,
  menu: <path d="M2.5 4.5h11M2.5 8h11M2.5 11.5h11" />,
} as const

export type IconName = keyof typeof paths

// Inline SVG glyph — stroke inherits currentColor, sized 1em via .icon.
export const Icon = ({
  className,
  name,
}: {
  className?: string
  name: IconName
}) => (
  <svg
    aria-hidden="true"
    className={cx('icon', className)}
    fill="none"
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth={1.5}
    viewBox="0 0 16 16"
  >
    {paths[name]}
  </svg>
)
