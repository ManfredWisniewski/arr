import React from 'react'

import { cx } from '@/lib/cx'

// Multi-line input — .input look plus .textarea (height + resize).
export const Textarea = ({
  className,
  rows = 4,
  ...rest
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => (
  <textarea
    className={cx('input', 'textarea', className)}
    rows={rows}
    {...rest}
  />
)
