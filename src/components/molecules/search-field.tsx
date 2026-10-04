import React from 'react'

import { cx } from '@/lib/cx'

import { Icon } from '../atoms/icon'
import { Input } from '../atoms/input'

// Search input + submit button (.search-field contract class).
// Wrap in a <form> to wire submission.
export const SearchField = ({
  className,
  name = 'q',
  placeholder = 'Suchen …',
  ...inputProps
}: {
  className?: string
} & React.InputHTMLAttributes<HTMLInputElement>) => (
  <div className={cx('search-field', className)}>
    <Input
      aria-label={placeholder}
      className="search-field-input"
      name={name}
      placeholder={placeholder}
      type="search"
      {...inputProps}
    />
    <button
      aria-label="Suchen"
      className="search-field-button"
      type="submit"
    >
      <Icon name="search" />
    </button>
  </div>
)
