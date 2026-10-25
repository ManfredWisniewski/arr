'use client'

import React, { useState } from 'react'

import { Button } from '@/components/atoms'
import { Drawer } from '@/components/organisms'

// Demo trigger for the Drawer organism — used by ComponentShowcase.
// `side` switches between right (default), left and bottom sheets.
export const DrawerDemo = ({ side }: { side?: 'bottom' | 'left' | 'right' }) => {
  const [open, setOpen] = useState(false)
  const label = side === 'bottom' ? 'Bottom Sheet' : 'Drawer'
  return (
    <>
      <Button onClick={() => setOpen(true)} variant="secondary">
        {label} öffnen
      </Button>
      <Drawer
        label="Demo-Panel"
        onClose={() => setOpen(false)}
        open={open}
        side={side}
        title={label}
      >
        <p>Seitenpanel — schließt per Esc, Backdrop-Klick oder Button.</p>
      </Drawer>
    </>
  )
}
