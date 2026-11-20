'use client'

import React, { useState } from 'react'

import { Chip, ChipSet } from '@/components/molecules'

// Chip set demo — the input chip needs a real onRemove handler, which
// only works from a client component (showcase itself is server-rendered).
export const ChipsDemo = () => {
  const [removed, setRemoved] = useState(false)
  return (
    <ChipSet>
      <Chip icon="info" variant="assist">Assist</Chip>
      <Chip selected variant="filter">Filter aktiv</Chip>
      <Chip variant="filter">Filter</Chip>
      {!removed ? (
        <Chip onRemove={() => setRemoved(true)} variant="input">Input</Chip>
      ) : null}
      <Chip variant="suggestion">Vorschlag</Chip>
    </ChipSet>
  )
}
