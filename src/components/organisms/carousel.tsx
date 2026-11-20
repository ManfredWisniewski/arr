'use client'

import React from 'react'

import { cx } from '@/lib/cx'

import { IconButton } from '../atoms/icon-button'

const CarouselContext = React.createContext<{
  contentRef: React.RefObject<HTMLDivElement | null>
  scrollBy: (dir: -1 | 1) => void
} | null>(null)

const useCarousel = () => {
  const ctx = React.useContext(CarouselContext)
  if (!ctx) {
    throw new Error('Carousel parts must be used inside <Carousel>')
  }
  return ctx
}

export type CarouselLayout = 'fullScreen' | 'hero' | 'multiBrowse'

// Scroll-snap carousel (.carousel* contract classes). Layouts per M3:
// 'multiBrowse' (natural item widths, default), 'hero' (85% items
// centered), 'fullScreen' (one item per view). Prev/next buttons are
// hover-reveal and scroll by one item width.
export const Carousel = ({
  children,
  className,
  layout = 'multiBrowse',
}: {
  children: React.ReactNode
  className?: string
  layout?: CarouselLayout
}) => {
  const contentRef = React.useRef<HTMLDivElement | null>(null)

  const scrollBy = React.useCallback((dir: -1 | 1) => {
    const el = contentRef.current
    if (!el) {
      return
    }
    const item = el.querySelector<HTMLElement>('.carousel-item')
    const amount = item
      ? item.offsetWidth + parseFloat(getComputedStyle(el).gap || '0')
      : el.clientWidth
    el.scrollBy({ behavior: 'smooth', left: dir * amount })
  }, [])

  return (
    <CarouselContext.Provider value={{ contentRef, scrollBy }}>
      <div className={cx('carousel', className)} data-layout={layout}>
        {children}
      </div>
    </CarouselContext.Provider>
  )
}

export const CarouselContent = ({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) => {
  const { contentRef } = useCarousel()
  return (
    <div className={cx('carousel-track', className)} ref={contentRef}>
      {children}
    </div>
  )
}

export const CarouselItem = ({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) => <div className={cx('carousel-item', className)}>{children}</div>

const CarouselNav = ({
  'aria-label': ariaLabel,
  className,
  direction,
  icon,
}: {
  'aria-label': string
  className?: string
  direction: -1 | 1
  icon: 'chevron-left' | 'chevron-right'
}) => {
  const { scrollBy } = useCarousel()
  return (
    <IconButton
      aria-label={ariaLabel}
      className={cx('carousel-nav', direction === -1 ? 'carousel-prev' : 'carousel-next', className)}
      icon={icon}
      onClick={() => scrollBy(direction)}
      variant="filled"
    />
  )
}

export const CarouselPrevious = () => (
  <CarouselNav aria-label="Zurück" direction={-1} icon="chevron-left" />
)

export const CarouselNext = () => (
  <CarouselNav aria-label="Weiter" direction={1} icon="chevron-right" />
)
