import React from 'react'

import { cx } from '@/lib/cx'

// Loading spinner — rotating border circle (.spinner contract class,
// sized 1em so it inherits context). `label` for screen readers.
export const Spinner = ({
  className,
  label = 'Lädt',
}: {
  className?: string
  label?: string
}) => (
  <span aria-label={label} className={cx('spinner', className)} role="status" />
)
