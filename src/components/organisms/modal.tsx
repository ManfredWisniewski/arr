'use client'

import React, { useEffect, useRef } from 'react'

import { ButtonGroup, type ButtonGroupItem } from '../molecules/button-group'
import { Icon } from '../atoms/icon'
import { Heading } from '../atoms/text'

// <dialog>-based modal: native focus trap, Esc close and ::backdrop.
// `open` is controlled; backdrop click and Esc surface via onClose.
// Optional `title` renders a header; `actions` renders a footer row.
export const Modal = ({
  actions,
  children,
  label,
  onClose,
  open,
  title,
}: {
  actions?: ButtonGroupItem[]
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
      {title ? (
        <header className="modal-header">
          <Heading className="modal-title" level={2}>
            {title}
          </Heading>
          <button
            aria-label="Schließen"
            className="modal-close"
            onClick={() => ref.current?.close()}
            type="button"
          >
            <Icon name="close" />
          </button>
        </header>
      ) : (
        <button
          aria-label="Schließen"
          className="modal-close"
          onClick={() => ref.current?.close()}
          type="button"
        >
          <Icon name="close" />
        </button>
      )}
      <div className="modal-body">{children}</div>
      {actions?.length ? (
        <footer className="modal-footer">
          <ButtonGroup items={actions} />
        </footer>
      ) : null}
    </dialog>
  )
}
