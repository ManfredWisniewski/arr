'use client'

import React, { useEffect, useRef } from 'react'

import { cx } from '@/lib/cx'

import { Icon } from '../atoms/icon'
import { Heading } from '../atoms/text'

// Sheet / slide-in panel — <dialog> anchored to an edge (.drawer*
// contract classes). `side` picks right (default), left or bottom;
// `modal={false}` opens it as a standard (non-modal) sheet — no
// backdrop, rest of the page stays interactive. Same control model
// as Modal.
export const Drawer = ({
  children,
  label,
  modal = true,
  onClose,
  open,
  side = 'right',
  title,
}: {
  children: React.ReactNode
  label: string
  modal?: boolean
  onClose: () => void
  open: boolean
  side?: 'bottom' | 'left' | 'right'
  title?: string
}) => {
  const ref = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) {
      return
    }
    if (open && !el.open) {
      if (modal) {
        el.showModal()
      } else {
        el.show()
      }
    } else if (!open && el.open) {
      el.close()
    }
  }, [modal, open])

  return (
    <dialog
      aria-label={label}
      className={cx('drawer', side !== 'right' && `drawer-${side}`)}
      onClose={onClose}
      onClick={(event) => {
        if (modal && event.target === ref.current) {
          ref.current?.close()
        }
      }}
      ref={ref}
    >
      {side === 'bottom' ? <span aria-hidden className="drawer-handle" /> : null}
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
