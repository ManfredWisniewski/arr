import React from 'react'

import { cx } from '@/lib/cx'

// Text input atom (.input contract class). No consumers yet — exists for
// the component showcase and future form templates.
export const Input = ({
  className,
  type = 'text',
  ...rest
}: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input className={cx('input', className)} type={type} {...rest} />
)
