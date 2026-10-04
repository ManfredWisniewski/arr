'use client'

import React from 'react'

import { cx } from '@/lib/cx'

import { Icon } from '../atoms/icon'

// Single-choice checkbox — native input + styled box with check glyph,
// .checkbox* contract classes. Controlled or uncontrolled; submits
// `value` under `name` in forms when checked.
export const Checkbox = ({
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
  label?: string
  name?: string
  onChange?: (checked: boolean) => void
  value?: string
}) => (
  <label className={cx('checkbox', className)}>
    <input
      checked={checked}
      className="checkbox-input"
      defaultChecked={defaultChecked}
      disabled={disabled}
      name={name}
      onChange={
        onChange ? (event) => onChange(event.target.checked) : undefined
      }
      type="checkbox"
      value={value}
    />
    <span aria-hidden="true" className="checkbox-box">
      <Icon name="check" />
    </span>
    {label ? <span className="checkbox-label">{label}</span> : null}
  </label>
)
