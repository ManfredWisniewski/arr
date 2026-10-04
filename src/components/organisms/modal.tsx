'use client'

import React, { useEffect, useRef } from 'react'

import { Icon } from '../atoms/icon'

// <dialog>-based modal: native focus trap, Esc close and ::backdrop.
// `open` is controlled; backdrop click and Esc surface via onClose.
export const Modal = ({
  children,
  label,
  onClose,
  open,
}: {
  children: React.ReactNode
  label: string
  onClose: () => void
  open: boolean
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
      className="modal"
      onClose={onClose}
      onClick={(event) => {
        // clicks on the dialog element itself land on the backdrop
        if (event.target === ref.current) {
          ref.current?.close()
        }
      }}
      ref={ref}
    >
      <button
        aria-label="Schließen"
        className="modal-close"
        onClick={() => ref.current?.close()}
        type="button"
      >
        <Icon name="close" />
      </button>
      {children}
    </dialog>
  )
}
