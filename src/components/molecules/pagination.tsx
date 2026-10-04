import React from 'react'

import { cx } from '@/lib/cx'

import { Icon } from '../atoms/icon'
import { Link } from '../atoms/link'

// Page navigation — prev/next + numbered links (.pagination contract).
// `hrefFor` maps a page number to a URL; `current` gets aria-current.
export const Pagination = ({
  className,
  current,
  hrefFor,
  total,
}: {
  className?: string
  current: number
  hrefFor: (page: number) => string
  total: number
}) => {
  if (total <= 1) {
    return null
  }
  return (
    <nav aria-label="Seitennavigation" className={cx('pagination', className)}>
      {current > 1 ? (
        <Link className="pagination-item pagination-prev" href={hrefFor(current - 1)}>
          <Icon name="chevron-left" /> Zurück
        </Link>
      ) : null}
      {Array.from({ length: total }, (_, i) => i + 1).map((page) =>
        page === current ? (
          <span
            aria-current="page"
            className="pagination-item pagination-current"
            key={page}
          >
            {page}
          </span>
        ) : (
          <Link className="pagination-item" href={hrefFor(page)} key={page}>
            {page}
          </Link>
        ),
      )}
      {current < total ? (
        <Link className="pagination-item pagination-next" href={hrefFor(current + 1)}>
          Weiter <Icon name="chevron-right" />
        </Link>
      ) : null}
    </nav>
  )
}
