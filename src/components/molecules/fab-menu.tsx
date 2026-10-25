'use client'

import React from 'react'

import { cx } from '@/lib/cx'

import { Fab } from '../atoms/fab'
import { Icon, type IconName } from '../atoms/icon'
import { Link } from '../atoms/link'

export type FabMenuItem = {
  href?: string
  icon: IconName
  label: string
  onSelect?: () => void
}

// FAB speed-dial — FAB trigger opens a column of label-chip + mini-FAB
// actions (.fabmenu* contract classes). Closes on outside pointerdown
// and Escape.
export const FabMenu = ({
  className,
  icon = 'plus',
  items,
}: {
  className?: string
  icon?: IconName
  items: FabMenuItem[]
}) => {
  const [open, setOpen] = React.useState(false)
  const rootRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    if (!open) {
      return
    }
    const onDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false)
      }
    }
    document.addEventListener('pointerdown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div className={cx('fabmenu', open && 'fabmenu-open', className)} ref={rootRef}>
      <Fab
        aria-expanded={open}
        icon={icon}
        onClick={() => setOpen((o) => !o)}
        variant="primary"
      />
      <div className="fabmenu-items" hidden={!open}>
        {items.map((item) => {
          const inner = (
            <>
              <span className="fabmenu-label">{item.label}</span>
              <span className="fabmenu-mini">
                <Icon name={item.icon} />
              </span>
            </>
          )
          return item.href ? (
            <Link className="fabmenu-item" href={item.href} key={item.label}>
              {inner}
            </Link>
          ) : (
            <button
              className="fabmenu-item"
              key={item.label}
              onClick={() => {
                item.onSelect?.()
                setOpen(false)
              }}
              type="button"
            >
              {inner}
            </button>
          )
        })}
      </div>
    </div>
  )
}
