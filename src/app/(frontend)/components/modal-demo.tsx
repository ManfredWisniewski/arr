'use client'

import React, { useState } from 'react'

import { Button } from '@/components/atoms'
import { Modal } from '@/components/organisms'

export const ModalDemo = () => {
  const [open, setOpen] = useState(false)
  return (
    <>
      <Button onClick={() => setOpen(true)} variant="primary">
        Modal öffnen
      </Button>
      <Modal
        label="Demo-Dialog"
        onClose={() => setOpen(false)}
        open={open}
      >
        <h2>Modal</h2>
        <p>
          Dialog-Inhalt — schließt per Esc, Backdrop-Klick oder dem
          Schließen-Button.
        </p>
      </Modal>
    </>
  )
}
