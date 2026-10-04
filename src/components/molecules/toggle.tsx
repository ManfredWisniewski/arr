'use client'

import React from 'react'

import { cx } from '@/lib/cx'

// On/off switch — checkbox input (role="switch") + styled track/thumb,
// .toggle* contract classes. Controlled (checked/onChange) or
// uncontrolled (defaultChecked); submits `name` in forms when on.
export const Toggle = ({
  checked,
  className,
  defaultChecked,
  disabled,
  label,
  name,
  onChange,
}: {
  checked?: boolean
  className?: string
  defaultChecked?: boolean
  disabled?: boolean
  label?: string
  name?: string
  onChange?: (checked: boolean) => void
}) => (
  <label className={cx('toggle', className)}>
    <input
      checked={checked}
      className="toggle-input"
      defaultChecked={defaultChecked}
      disabled={disabled}
      name={name}
      onChange={
        onChange ? (event) => onChange(event.target.checked) : undefined
      }
      role="switch"
      type="checkbox"
    />
    <span aria-hidden="true" className="toggle-track">
      <span className="toggle-thumb" />
    </span>
    {label ? <span className="toggle-label">{label}</span> : null}
  </label>
)
