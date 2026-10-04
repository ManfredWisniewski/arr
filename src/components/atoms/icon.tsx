import React from 'react'

import { cx } from '@/lib/cx'

const paths = {
  check: <path d="M3 8.5l3.5 3.5 6.5-8" />,
  'chevron-down': <path d="M4 6l4 4 4-4" />,
  'chevron-left': <path d="M10 4L6 8l4 4" />,
  'chevron-right': <path d="M6 4l4 4-4 4" />,
  'chevron-up': <path d="M4 10l4-4 4 4" />,
  close: <path d="M4 4l8 8M12 4l-8 8" />,
  external: <path d="M6.5 3.5H3.5v9h9V9.5M9 3h4v4M12.5 3.5L8 8" />,
  info: (
    <>
      <circle cx="8" cy="8" r="5.75" />
      <path d="M8 7.25v3.5M8 4.75v.01" />
    </>
  ),
  menu: <path d="M2.5 4.5h11M2.5 8h11M2.5 11.5h11" />,
  plus: <path d="M8 3v10M3 8h10" />,
  search: (
    <>
      <circle cx="7" cy="7" r="4.25" />
      <path d="M10.25 10.25L14 14" />
    </>
  ),
  user: (
    <>
      <circle cx="8" cy="5.25" r="2.5" />
      <path d="M3.5 13.5c1-2.25 2.5-3.25 4.5-3.25s3.5 1 4.5 3.25" />
    </>
  ),
  warning: (
    <>
      <path d="M8 2.5L14.5 13.5h-13L8 2.5z" />
      <path d="M8 6.5v3.5M8 11.5v.01" />
    </>
  ),
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
