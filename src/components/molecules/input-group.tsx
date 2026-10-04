import React from 'react'

import { cx } from '@/lib/cx'

import { Input } from '../atoms/input'

// Input with prefix/suffix addons — text, icons or a button slot
// (.input-group* contract classes).
export const InputGroup = ({
  className,
  prefix,
  suffix,
  ...inputProps
}: {
  className?: string
  prefix?: React.ReactNode
  suffix?: React.ReactNode
} & React.InputHTMLAttributes<HTMLInputElement>) => (
  <div className={cx('input-group', className)}>
    {prefix ? <span className="input-group-addon">{prefix}</span> : null}
    <Input className="input-group-input" {...inputProps} />
    {suffix ? <span className="input-group-addon">{suffix}</span> : null}
  </div>
)
