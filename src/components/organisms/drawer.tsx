'use client'

import React, { useEffect, useRef } from 'react'

import { cx } from '@/lib/cx'

import { Icon } from '../atoms/icon'
import { Heading } from '../atoms/text'

// Slide-in side panel — <dialog> anchored to the right edge
// (.drawer* contract classes). Same control model as Modal.
export const Drawer = ({
  children,
  label,
  onClose,
  open,
  title,
}: {
  children: React.ReactNode
  label: string
  onClose: () => void
  open: boolean
  title?: string
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
    <dialog
      aria-label={label}
      className="drawer"
      onClose={onClose}
      onClick={(event) => {
        if (event.target === ref.current) {
          ref.current?.close()
        }
      }}
      ref={ref}
    >
      <header className={cx('drawer-header')}>
        {title ? (
          <Heading className="drawer-title" level={2}>
            {title}
          </Heading>
        ) : null}
        <button
          aria-label="Schließen"
          className="drawer-close"
          onClick={() => ref.current?.close()}
          type="button"
        >
          <Icon name="close" />
        </button>
      </header>
      <div className="drawer-body">{children}</div>
    </dialog>
  )
}
