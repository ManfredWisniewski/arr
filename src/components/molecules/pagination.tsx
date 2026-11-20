import { useTranslations } from 'next-intl'
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
  const t = useTranslations('pagination')
  if (total <= 1) {
    return null
  }
  return (
    <nav aria-label={t('ariaLabel')} className={cx('pagination', className)}>
      {current > 1 ? (
        <Link className="pagination-item pagination-prev" href={hrefFor(current - 1)}>
          <Icon name="chevron-left" /> {t('previous')}
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
          {t('next')} <Icon name="chevron-right" />
        </Link>
      ) : null}
    </nav>
  )
}
