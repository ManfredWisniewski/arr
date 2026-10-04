import React from 'react'

import { cx } from '@/lib/cx'

// Form-control label — binds via htmlFor, optional required marker.
export const Label = ({
  children,
  className,
  required,
  ...rest
}: React.LabelHTMLAttributes<HTMLLabelElement> & { required?: boolean }) => (
  <label className={cx('label', className)} {...rest}>
    {children}
    {required ? (
      <span aria-hidden="true" className="label-required">
        {' '}
        *
      </span>
    ) : null}
  </label>
)
