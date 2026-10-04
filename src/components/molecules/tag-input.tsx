'use client'

import React, { useState } from 'react'

import { cx } from '@/lib/cx'

import { Input } from '../atoms/input'
import { Pill } from './pill'

// Tag editor — Input + dynamic Pill list; Enter adds, click on a pill's
// × removes. `.tag-input*` contract classes.
export const TagInput = ({
  className,
  name,
  onChange,
  placeholder = 'Tag hinzufügen …',
  tags: initial,
}: {
  className?: string
  name?: string
  onChange?: (tags: string[]) => void
  placeholder?: string
  tags?: string[]
}) => {
  const [tags, setTags] = useState<string[]>(initial ?? [])
  const update = (next: string[]) => {
    setTags(next)
    onChange?.(next)
  }
  return (
    <div className={cx('tag-input', className)}>
      {tags.map((tag) => (
        <span className="tag-input-tag" key={tag}>
          <Pill>{tag}</Pill>
          <button
            aria-label={`${tag} entfernen`}
            className="tag-input-remove"
            onClick={() => update(tags.filter((t) => t !== tag))}
            type="button"
          >
            ×
          </button>
        </span>
      ))}
      <Input
        aria-label={placeholder}
        className="tag-input-input"
        onKeyDown={(event) => {
          const value = event.currentTarget.value.trim()
          if (event.key === 'Enter' && value && !tags.includes(value)) {
            event.preventDefault()
            update([...tags, value])
            event.currentTarget.value = ''
          }
        }}
        placeholder={placeholder}
      />
      {name ? (
        <input name={name} type="hidden" value={tags.join(',')} />
      ) : null}
    </div>
  )
}
