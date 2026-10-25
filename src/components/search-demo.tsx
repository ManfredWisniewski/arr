'use client'

import React, { useState } from 'react'

import { SearchBar, SearchView } from '@/components/organisms'

// Demo trigger for the SearchView organism — used by ComponentShowcase.
export const SearchDemo = () => {
  const [open, setOpen] = useState(false)
  return (
    <>
      <SearchBar onClick={() => setOpen(true)} />
      <SearchView onClose={() => setOpen(false)} open={open}>
        <p>Ergebnisbereich — Inhalte kommen hierhin.</p>
      </SearchView>
    </>
  )
}
