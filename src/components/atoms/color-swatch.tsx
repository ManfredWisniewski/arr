import React from 'react'

import { cx } from '@/lib/cx'

// Design-token color preview — box filled with a CSS variable plus the
// token name. For design docs/theme pickers (.color-swatch classes).
export const ColorSwatch = ({
  className,
  token,
}: {
  className?: string
  token: string
}) => (
  <span className={cx('color-swatch', className)}>
    <span
      aria-hidden="true"
      className="color-swatch-box"
      style={{ background: `var(--${token})` }}
    />
    <code className="color-swatch-name">--{token}</code>
  </span>
)
