'use client'

import React, { useEffect, useRef } from 'react'

import { cx } from '@/lib/cx'

import { Icon, type IconName } from '../atoms/icon'

// Pill-shaped search trigger — opens the full-screen SearchView
// (.searchbar contract class).
export const SearchBar = ({
  className,
  leading,
  onClick,
  placeholder = 'Suche',
  trailing,
}: {
  className?: string
  leading?: IconName
  onClick?: () => void
  placeholder?: string
  trailing?: React.ReactNode
}) => (
  <button className={cx('searchbar', className)} onClick={onClick} type="button">
    <Icon name={leading ?? 'search'} />
    <span className="searchbar-text">{placeholder}</span>
    {trailing}
  </button>
)

// Full-screen search overlay — <dialog> with back button, input and a
// scrollable results area (.searchview* contract classes). Same control
// model as Modal/Drawer.
export const SearchView = ({
  children,
  inputProps,
  label = 'Suche',
  onClose,
  open,
  placeholder = 'Suche',
}: {
  children?: React.ReactNode
  inputProps?: React.InputHTMLAttributes<HTMLInputElement>
  label?: string
  onClose: () => void
  open: boolean
  placeholder?: string
}) => {
  const ref = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) {
      return
    }
    if (open && !el.open) {
      el.showModal()
    } else if (!open && el.open) {
      el.close()
    }
  }, [open])

  return (
    <dialog aria-label={label} className="searchview" onClose={onClose} ref={ref}>
      <div className="searchview-input">
        <button
          aria-label="Zurück"
          className="searchview-back"
          onClick={() => ref.current?.close()}
          type="button"
        >
          <Icon name="arrow-left" />
        </button>
        <input
          autoFocus={open}
          className="searchview-field"
          placeholder={placeholder}
          type="search"
          {...inputProps}
        />
      </div>
      <div className="searchview-results">{children}</div>
    </dialog>
  )
}
