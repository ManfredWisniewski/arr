'use client'

import React, { useState } from 'react'

import { Button } from '@/components/atoms'
import { Modal } from '@/components/organisms'

// Demo trigger for the Modal organism — used by ComponentShowcase.
export const ModalDemo = () => {
  const [open, setOpen] = useState(false)
  return (
    <>
      <Button onClick={() => setOpen(true)} variant="primary">
        Modal öffnen
      </Button>
      <Modal
        actions={[
          { label: 'Abbrechen' },
          { label: 'Bestätigen', variant: 'primary' },
        ]}
        label="Demo-Dialog"
        onClose={() => setOpen(false)}
        open={open}
        title="Modal"
      >
        <p>
          Dialog-Inhalt — schließt per Esc, Backdrop-Klick oder dem
          Schließen-Button. Header und Footer kommen aus den `title`- und
          `actions`-Props.
        </p>
      </Modal>
    </>
  )
}
