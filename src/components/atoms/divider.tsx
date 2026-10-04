import React from 'react'

import { cx } from '@/lib/cx'

// Section separator — semantic <hr> with the .divider contract class.
export const Divider = ({ className }: { className?: string }) => (
  <hr className={cx('divider', className)} />
)
