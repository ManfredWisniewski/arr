'use client'

import React, { useRef, useState } from 'react'

import { cx } from '@/lib/cx'

import { Button } from '../atoms/button'
import { Icon } from '../atoms/icon'

export type DateRange = { from?: Date; to?: Date }
export type DatePickerValue = Date | DateRange | undefined

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate())

const sameDay = (a?: Date, b?: Date) =>
  !!a && !!b && startOfDay(a).getTime() === startOfDay(b).getTime()

const monthLabel = (d: Date) =>
  d.toLocaleDateString('de-DE', { month: 'long', year: 'numeric' })

const dayLabel = (d: Date) => d.toLocaleDateString('de-DE')

export const formatDateValue = (v: DatePickerValue): string => {
  if (!v) {
    return ''
  }
  if (v instanceof Date) {
    return dayLabel(v)
  }
  if (!v.from) {
    return ''
  }
  return v.to ? `${dayLabel(v.from)} – ${dayLabel(v.to)}` : `${dayLabel(v.from)} –`
}

export type CalendarDay = {
  date: Date
  outside: boolean
  range: boolean
  rangeEnd: boolean
  rangeStart: boolean
  selected: boolean
  today: boolean
}

// Month grid calendar — Monday-first weeks, 6 rows of 7 cells
// (.calendar/.cal-* contract classes). `onNavigate` moves a month; day
// cells report `onSelect`.
export const Calendar = ({
  className,
  month,
  onNavigate,
  onSelect,
  selected,
}: {
  className?: string
  month: Date
  onNavigate: (month: Date) => void
  onSelect: (day: Date) => void
  selected?: DatePickerValue
}) => {
  const today = new Date()
  const year = month.getFullYear()
  const mon = month.getMonth()
  const first = new Date(year, mon, 1)
  // Monday-first offset: JS Sunday=0 → 6
  const offset = (first.getDay() + 6) % 7
  const gridStart = new Date(year, mon, 1 - offset)

  const range = selected && !(selected instanceof Date) ? selected : undefined
  const single = selected instanceof Date ? selected : undefined
  const rangeFrom = range?.from ? startOfDay(range.from) : undefined
  const rangeTo = range?.to ? startOfDay(range.to) : rangeFrom

  const weeks: CalendarDay[][] = []
  for (let w = 0; w < 6; w++) {
    const week: CalendarDay[] = []
    for (let d = 0; d < 7; d++) {
      const date = new Date(gridStart.getFullYear(), gridStart.getMonth(), gridStart.getDate() + w * 7 + d)
      const t = date.getTime()
      const isStart = !!rangeFrom && sameDay(date, rangeFrom)
      const isEnd = !!range?.to && sameDay(date, range.to)
      week.push({
        date,
        outside: date.getMonth() !== mon,
        range:
          !!rangeFrom && !!rangeTo && t > rangeFrom.getTime() && t < rangeTo.getTime(),
        rangeEnd: isEnd,
        rangeStart: isStart,
        selected: sameDay(date, single) || isStart || isEnd,
        today: sameDay(date, today),
      })
    }
    weeks.push(week)
  }

  return (
    <div className={cx('calendar', className)}>
      <div className="cal-head">
        <span className="cal-caption">{monthLabel(month)}</span>
        <span className="cal-nav">
          <button
            aria-label="Voriger Monat"
            className="cal-navbtn"
            onClick={() => onNavigate(new Date(year, mon - 1, 1))}
            type="button"
          >
            <Icon name="chevron-left" />
          </button>
          <button
            aria-label="Nächster Monat"
            className="cal-navbtn"
            onClick={() => onNavigate(new Date(year, mon + 1, 1))}
            type="button"
          >
            <Icon name="chevron-right" />
          </button>
        </span>
      </div>
      <div className="cal-grid" role="grid">
        {['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'].map((d) => (
          <span className="cal-weekday" key={d} role="columnheader">
            {d}
          </span>
        ))}
        {weeks.flat().map((day) => (
          <button
            aria-selected={day.selected || undefined}
            className={cx(
              'cal-day',
              day.outside && 'cal-day-out',
              day.today && 'cal-day-today',
              day.selected && 'cal-day-sel',
              day.range && 'cal-day-range',
              day.rangeStart && 'cal-day-start',
              day.rangeEnd && 'cal-day-end',
            )}
            key={day.date.toISOString()}
            onClick={() => onSelect(day.date)}
            role="gridcell"
            type="button"
          >
            {day.date.getDate()}
          </button>
        ))}
      </div>
    </div>
  )
}

// Date picker — field trigger + <dialog> with Calendar, Cancel/OK
// (.datepicker* contract classes). `mode="range"` selects a from/to
// interval; the draft applies on OK.
export const DatePicker = ({
  className,
  defaultValue,
  label = 'Datum wählen',
  mode = 'single',
  onChange,
  placeholder = 'Datum wählen',
  value,
}: {
  className?: string
  defaultValue?: DatePickerValue
  label?: string
  mode?: 'range' | 'single'
  onChange?: (value: DatePickerValue) => void
  placeholder?: string
  value?: DatePickerValue
}) => {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const isControlled = value !== undefined
  const [internal, setInternal] = useState<DatePickerValue>(defaultValue)
  const committed = isControlled ? value : internal
  const [draft, setDraft] = useState<DatePickerValue>(committed)
  const [viewMonth, setViewMonth] = useState(() => {
    const base = committed instanceof Date ? committed : committed?.from
    return base ? new Date(base.getFullYear(), base.getMonth(), 1) : new Date()
  })

  const open = () => {
    setDraft(committed)
    const base = committed instanceof Date ? committed : committed?.from
    if (base) {
      setViewMonth(new Date(base.getFullYear(), base.getMonth(), 1))
    }
    dialogRef.current?.showModal()
  }

  const close = () => dialogRef.current?.close()

  const apply = () => {
    if (!isControlled) {
      setInternal(draft)
    }
    onChange?.(draft)
    close()
  }

  const onSelect = (day: Date) => {
    if (mode === 'single') {
      setDraft(day)
      return
    }
    const current = draft && !(draft instanceof Date) ? draft : undefined
    if (!current?.from || current.to) {
      setDraft({ from: day })
    } else if (day.getTime() < current.from.getTime()) {
      setDraft({ from: day })
    } else {
      setDraft({ from: current.from, to: day })
    }
  }

  const text = formatDateValue(committed)

  return (
    <span className={cx('datepicker', className)}>
      <button className="datepicker-trigger" onClick={open} type="button">
        <Icon name="calendar" />
        <span className={cx('datepicker-text', !text && 'datepicker-placeholder')}>
          {text || placeholder}
        </span>
      </button>
      <dialog aria-label={label} className="datepicker-dialog" ref={dialogRef}>
        <div className="datepicker-head">
          <span className="datepicker-eyebrow">
            {mode === 'range' ? 'Zeitraum wählen' : 'Datum wählen'}
          </span>
          <span className="datepicker-value">{formatDateValue(draft) || '—'}</span>
        </div>
        <Calendar month={viewMonth} onNavigate={setViewMonth} onSelect={onSelect} selected={draft} />
        <div className="datepicker-actions">
          <Button onClick={close} variant="ghost">
            Abbrechen
          </Button>
          <Button onClick={apply} variant="primary">
            OK
          </Button>
        </div>
      </dialog>
    </span>
  )
}
