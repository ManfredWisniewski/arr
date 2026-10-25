import React from 'react'

import { cx } from '@/lib/cx'

const paths = {
  'arrow-left': <path d="M12.5 8H3.5M8 12.5L3.5 8 8 3.5" />,
  calendar: (
    <>
      <rect height="10" rx="1.5" width="11" x="2.5" y="3.5" />
      <path d="M2.5 7h11M5.5 1.5v4M10.5 1.5v4" />
    </>
  ),
  check: <path d="M3 8.5l3.5 3.5 6.5-8" />,
  'chevron-down': <path d="M4 6l4 4 4-4" />,
  'chevron-left': <path d="M10 4L6 8l4 4" />,
  'chevron-right': <path d="M6 4l4 4-4 4" />,
  'chevron-up': <path d="M4 10l4-4 4 4" />,
  clock: (
    <>
      <circle cx="8" cy="8" r="5.75" />
      <path d="M8 4.75V8l2.25 1.5" />
    </>
  ),
  close: <path d="M4 4l8 8M12 4l-8 8" />,
  download: <path d="M8 2.5v8M4.5 7L8 10.5 11.5 7M3 13.5h10" />,
  edit: (
    <>
      <path d="M10.7 2.8l2.5 2.5-7.2 7.2H3.5v-2.5l7.2-7.2z" />
      <path d="M2.5 13.5h11" />
    </>
  ),
  external: <path d="M6.5 3.5H3.5v9h9V9.5M9 3h4v4M12.5 3.5L8 8" />,
  image: (
    <>
      <rect height="10" rx="1.5" width="11" x="2.5" y="3" />
      <circle cx="6" cy="6.5" r="1.25" />
      <path d="M13.5 11l-3-3-5 5" />
    </>
  ),
  info: (
    <>
      <circle cx="8" cy="8" r="5.75" />
      <path d="M8 7.25v3.5M8 4.75v.01" />
    </>
  ),
  keyboard: (
    <>
      <rect height="8" rx="1.5" width="13" x="1.5" y="4" />
      <path d="M4.5 7h.01M8 7h.01M11.5 7h.01M4.5 9.5h.01M8 9.5h.01M11.5 9.5h.01M5.5 10.5h5" />
    </>
  ),
  menu: <path d="M2.5 4.5h11M2.5 8h11M2.5 11.5h11" />,
  minus: <path d="M3.5 8h9" />,
  plus: <path d="M8 3v10M3 8h10" />,
  search: (
    <>
      <circle cx="7" cy="7" r="4.25" />
      <path d="M10.25 10.25L14 14" />
    </>
  ),
  send: (
    <>
      <path d="M13.5 2.5L2 7.25l5 1.75L8.75 14 13.5 2.5z" />
      <path d="M13.5 2.5L7 9" />
    </>
  ),
  settings: (
    <>
      <circle cx="8" cy="8" r="2.25" />
      <path d="M8 1.75v2M8 12.25v2M1.75 8h2M12.25 8h2M3.6 3.6l1.4 1.4M11 11l1.4 1.4M3.6 12.4L5 11M11 5l1.4-1.4" />
    </>
  ),
  star: <path d="M8 2l1.8 3.7 4.2.6-3 2.9.7 4.1L8 11.4 4.3 13.3l.7-4.1-3-2.9 4.2-.6L8 2z" />,
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
