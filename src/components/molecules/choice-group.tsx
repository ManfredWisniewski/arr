'use client'

import React, { useState } from 'react'

import { cx } from '@/lib/cx'

import { Checkbox } from './checkbox'
import { Radio } from './radio'

export type ChoiceOption = {
  disabled?: boolean
  label: string
  value: string
}

type GroupProps = {
  className?: string
  hint?: string
  label?: string
  name: string
  onChange?: (values: string[]) => void
  options: ChoiceOption[]
  values?: string[]
}

// Checkbox group — group label + N checkboxes sharing a context.
export const CheckboxGroup = ({
  className,
  hint,
  label,
  name,
  onChange,
  options,
  values,
}: GroupProps) => {
  const [selected, setSelected] = useState<string[]>(values ?? [])
  const toggle = (value: string) => {
    const next = selected.includes(value)
      ? selected.filter((v) => v !== value)
      : [...selected, value]
    setSelected(next)
    onChange?.(next)
  }
  return (
    <fieldset className={cx('choice-group', className)}>
      {label ? <legend className="choice-group-label">{label}</legend> : null}
      {options.map((option) => (
        <Checkbox
          checked={selected.includes(option.value)}
          disabled={option.disabled}
          key={option.value}
          label={option.label}
          name={name}
          onChange={() => toggle(option.value)}
          value={option.value}
        />
      ))}
      {hint ? <p className="choice-group-hint">{hint}</p> : null}
    </fieldset>
  )
}

// Radio group — mutually exclusive options under a shared label.
export const RadioGroup = ({
  className,
  hint,
  label,
  name,
  onChange,
  options,
  values,
}: GroupProps) => {
  const [selected, setSelected] = useState<string | undefined>(values?.[0])
  return (
    <fieldset className={cx('choice-group', className)}>
      {label ? <legend className="choice-group-label">{label}</legend> : null}
      {options.map((option) => (
        <Radio
          checked={selected === option.value}
          disabled={option.disabled}
          key={option.value}
          label={option.label}
          name={name}
          onChange={(value) => {
            setSelected(value)
            onChange?.([value])
          }}
          value={option.value}
        />
      ))}
      {hint ? <p className="choice-group-hint">{hint}</p> : null}
    </fieldset>
  )
}
