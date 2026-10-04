import React from 'react'

import { cx } from '@/lib/cx'

// Typography token preview — renders sample text at a token's
// family/size/weight plus the token name. Design-doc atom.
export const TypePreview = ({
  className,
  family,
  sample = 'Sphinx of black quartz, judge my vow.',
  size,
  weight,
}: {
  className?: string
  family?: string
  sample?: string
  size?: string
  weight?: string
}) => (
  <div className={cx('type-preview', className)}>
    <span
      className="type-preview-sample"
      style={{
        fontFamily: family ? `var(--${family})` : undefined,
        fontSize: size ? `calc(var(--${size}) * 1px)` : undefined,
        fontWeight: weight ? `var(--${weight})` : undefined,
      }}
    >
      {sample}
    </span>
    <code className="type-preview-name">
      {[size, weight, family].filter(Boolean).map((t) => `--${t}`).join(' ')}
    </code>
  </div>
)
