import React from 'react'

import { cx } from '@/lib/cx'

import { Select } from '../atoms/select'
import { ButtonGroup, type ButtonGroupItem } from '../molecules/button-group'
import { SearchField } from '../molecules/search-field'

export type FilterSelect = {
  name: string
  options: { label: string; value: string }[]
  placeholder?: string
}

// Filter control row — SearchField + Selects + ButtonGroup + optional
// pills slot (.filter-bar contract class). Wrap in a <form>.
export const FilterBar = ({
  buttons,
  children,
  className,
  searchPlaceholder,
  selects,
}: {
  buttons?: ButtonGroupItem[]
  children?: React.ReactNode
  className?: string
  searchPlaceholder?: string
  selects?: FilterSelect[]
}) => (
  <div className={cx('filter-bar', className)}>
    <SearchField placeholder={searchPlaceholder} />
    {selects?.map((select) => (
      <Select defaultValue="" key={select.name} name={select.name}>
        {select.placeholder ? (
          <option disabled value="">
            {select.placeholder}
          </option>
        ) : null}
        {select.options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </Select>
    ))}
    {buttons?.length ? <ButtonGroup items={buttons} /> : null}
    {children}
  </div>
)
