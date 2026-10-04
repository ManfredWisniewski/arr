'use client'

import React from 'react'

import { cx } from '@/lib/cx'

// Single radio — native input + styled circle (.radio* contract).
// Options of one group share the same `name`.
export const Radio = ({
  checked,
  className,
  defaultChecked,
  disabled,
  label,
  name,
  onChange,
  value,
}: {
  checked?: boolean
  className?: string
  defaultChecked?: boolean
  disabled?: boolean
  label: string
  name: string
  onChange?: (value: string) => void
  value: string
}) => (
  <label className={cx('radio', className)}>
    <input
      checked={checked}
      className="radio-input"
      defaultChecked={defaultChecked}
      disabled={disabled}
      name={name}
      onChange={onChange ? () => onChange(value) : undefined}
      type="radio"
      value={value}
    />
    <span aria-hidden="true" className="radio-circle" />
    <span className="radio-label">{label}</span>
  </label>
)
