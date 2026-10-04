'use client'

import React, { useState } from 'react'

import { Button } from '@/components/atoms'
import { Drawer } from '@/components/organisms'

// Demo trigger for the Drawer organism — used by ComponentShowcase.
export const DrawerDemo = () => {
  const [open, setOpen] = useState(false)
  return (
    <>
      <Button onClick={() => setOpen(true)} variant="secondary">
        Drawer öffnen
      </Button>
      <Drawer
        label="Demo-Panel"
        onClose={() => setOpen(false)}
        open={open}
        title="Drawer"
      >
        <p>Seitenpanel — schließt per Esc, Backdrop-Klick oder Button.</p>
      </Drawer>
    </>
  )
}
