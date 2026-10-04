import React from 'react'

import { cx } from '@/lib/cx'

import { Input } from '../atoms/input'
import { Label } from '../atoms/label'
import { Select } from '../atoms/select'
import { Textarea } from '../atoms/textarea'

// Complete input field unit — Label + control + hint or error text,
// .form-field* contract classes. `as` picks the control
// (input/textarea/select + `options`); `control` overrides entirely.
// `error` flips to the error state and wins over `hint`.
export const FormField = ({
  as,
  className,
  control,
  error,
  hint,
  label,
  name,
  options,
  required,
  ...inputProps
}: {
  as?: 'input' | 'select' | 'textarea'
  control?: React.ReactNode
  error?: string
  hint?: string
  label: string
  name: string
  options?: { label: string; value: string }[]
} & React.InputHTMLAttributes<HTMLInputElement> &
  React.TextareaHTMLAttributes<HTMLTextAreaElement> &
  React.SelectHTMLAttributes<HTMLSelectElement>) => {
  const id = `field-${name}`
  const messageId = `${id}-message`
  const fieldProps = {
    'aria-describedby': error || hint ? messageId : undefined,
    'aria-invalid': error ? true : undefined,
    id,
    name,
    required,
  } as const
  return (
    <div className={cx('form-field', error && 'form-field-error', className)}>
      <Label className="form-field-label" htmlFor={id} required={required}>
        {label}
      </Label>
      {control ??
        (as === 'textarea' ? (
          <Textarea {...fieldProps} {...inputProps} />
        ) : as === 'select' ? (
          <Select {...fieldProps} {...inputProps}>
            {options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        ) : (
          <Input {...fieldProps} {...inputProps} />
        ))}
      {error ? (
        <p
          className="form-field-message form-field-message-error"
          id={messageId}
          role="alert"
        >
          {error}
        </p>
      ) : hint ? (
        <p className="form-field-message" id={messageId}>
          {hint}
        </p>
      ) : null}
    </div>
  )
}
