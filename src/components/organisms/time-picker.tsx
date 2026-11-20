'use client'

import React, { useRef, useState } from 'react'

import { cx } from '@/lib/cx'

import { Button } from '../atoms/button'
import { Icon } from '../atoms/icon'
import { IconButton } from '../atoms/icon-button'
import { SegmentedButton, SegmentedButtonSet } from '../molecules/segmented-button'

interface TimeDraft {
  hour: number
  minute: number
  period: 'am' | 'pm'
}

type DialPhase = 'hour' | 'minute'

const parseTime = (value?: string): TimeDraft => {
  const m = /^(\d{1,2}):(\d{2})$/.exec(value ?? '')
  const h24 = m ? Math.min(23, parseInt(m[1], 10)) : 12
  const minute = m ? Math.min(59, parseInt(m[2], 10)) : 0
  return {
    hour: h24 % 12 === 0 ? 12 : h24 % 12,
    minute,
    period: h24 < 12 ? 'am' : 'pm',
  }
}

const serializeTime = (d: TimeDraft): string => {
  const h24 = d.period === 'am' ? d.hour % 12 : (d.hour % 12) + 12
  return `${String(h24).padStart(2, '0')}:${String(d.minute).padStart(2, '0')}`
}

const formatDisplay = (d: TimeDraft): string =>
  `${d.hour}:${String(d.minute).padStart(2, '0')} ${d.period.toUpperCase()}`

const DIAL_SIZE = 240
const DIAL_CENTER = DIAL_SIZE / 2
const DIAL_NUMBER_R = 100
const DIAL_HAND_R = 78

// toFixed(2) — raw trig output differs in the last ulp between Node and
// browser V8, which breaks hydration on rendered attributes.
const dialPoint = (angleDeg: number, r: number) => ({
  x: Number((DIAL_CENTER + r * Math.sin((angleDeg * Math.PI) / 180)).toFixed(2)),
  y: Number((DIAL_CENTER - r * Math.cos((angleDeg * Math.PI) / 180)).toFixed(2)),
})

// Clock-face dial — click/drag or arrow keys; hour phase advances to
// minute on release (.tp-dial* contract classes).
const TimeDial = ({
  draft,
  setDraft,
}: {
  draft: TimeDraft
  setDraft: React.Dispatch<React.SetStateAction<TimeDraft>>
}) => {
  const [phase, setPhase] = useState<DialPhase>('hour')
  const svgRef = useRef<SVGSVGElement | null>(null)
  const dragging = useRef(false)

  const pick = (clientX: number, clientY: number) => {
    const svg = svgRef.current
    if (!svg) {
      return
    }
    const rect = svg.getBoundingClientRect()
    const angle =
      (Math.atan2(
        clientX - rect.left - rect.width / 2,
        -(clientY - rect.top - rect.height / 2),
      ) *
        180) /
        Math.PI +
      360
    const norm = angle % 360
    if (phase === 'hour') {
      const hour = Math.round(norm / 30) % 12
      setDraft((d) => ({ ...d, hour: hour === 0 ? 12 : hour }))
    } else {
      setDraft((d) => ({ ...d, minute: Math.round(norm / 6) % 60 }))
    }
  }

  const currentAngle = phase === 'hour' ? (draft.hour % 12) * 30 : draft.minute * 6
  const hand = dialPoint(currentAngle, DIAL_HAND_R)
  const numbers = Array.from({ length: 12 }, (_, i) => {
    const n = i + 1
    const value = phase === 'hour' ? n : n * 5
    return {
      label: phase === 'hour' ? String(n) : String(n * 5).padStart(2, '0'),
      pos: dialPoint(n * 30, DIAL_NUMBER_R),
      selected: phase === 'hour' ? draft.hour === n : draft.minute === value % 60,
      value: n,
    }
  })

  return (
    <div className="tp-dial">
      <div className="tp-phase">
        <button
          className={cx('tp-phase-btn', phase === 'hour' && 'tp-phase-on')}
          onClick={() => setPhase('hour')}
          type="button"
        >
          Stunde
        </button>
        <button
          className={cx('tp-phase-btn', phase === 'minute' && 'tp-phase-on')}
          onClick={() => setPhase('minute')}
          type="button"
        >
          Minute
        </button>
      </div>
      <svg
        aria-label={phase === 'hour' ? 'Stunde wählen' : 'Minute wählen'}
        aria-valuemax={phase === 'hour' ? 12 : 59}
        aria-valuemin={phase === 'hour' ? 1 : 0}
        aria-valuenow={phase === 'hour' ? draft.hour : draft.minute}
        className="tp-dial-face"
        onKeyDown={(e) => {
          const delta =
            e.key === 'ArrowLeft' || e.key === 'ArrowDown'
              ? -1
              : e.key === 'ArrowRight' || e.key === 'ArrowUp'
                ? 1
                : 0
          if (!delta) {
            return
          }
          e.preventDefault()
          setDraft((d) =>
            phase === 'hour'
              ? { ...d, hour: ((d.hour - 1 + delta + 12) % 12) + 1 }
              : { ...d, minute: (d.minute + delta + 60) % 60 },
          )
        }}
        onPointerDown={(e) => {
          dragging.current = true
          e.currentTarget.setPointerCapture(e.pointerId)
          pick(e.clientX, e.clientY)
        }}
        onPointerMove={(e) => {
          if (dragging.current) {
            pick(e.clientX, e.clientY)
          }
        }}
        onPointerUp={() => {
          dragging.current = false
          if (phase === 'hour') {
            setPhase('minute')
          }
        }}
        ref={svgRef}
        role="slider"
        tabIndex={0}
        viewBox={`0 0 ${DIAL_SIZE} ${DIAL_SIZE}`}
      >
        {numbers.map(({ label, pos, selected, value }) => (
          <g key={value}>
            <circle
              className={cx('tp-num-hit', selected && 'tp-num-sel')}
              cx={pos.x}
              cy={pos.y}
              r={16}
            />
            <text
              className={cx('tp-num', selected && 'tp-num-sel')}
              dominantBaseline="central"
              textAnchor="middle"
              x={pos.x}
              y={pos.y}
            >
              {label}
            </text>
          </g>
        ))}
        <line className="tp-hand" x1={DIAL_CENTER} x2={hand.x} y1={DIAL_CENTER} y2={hand.y} />
        <circle className="tp-center" cx={DIAL_CENTER} cy={DIAL_CENTER} r={4} />
        <circle className="tp-hand-dot" cx={hand.x} cy={hand.y} r={10} />
      </svg>
    </div>
  )
}

// Time picker — field trigger + <dialog> with text inputs or clock dial
// (.timepicker/.tp-* contract classes). 'HH:mm' 24h value; OK applies
// the draft.
export const TimePicker = ({
  className,
  defaultValue,
  label = 'Uhrzeit wählen',
  mode = 'input',
  onChange,
  placeholder = 'Uhrzeit wählen',
  value,
}: {
  className?: string
  defaultValue?: string
  label?: string
  mode?: 'dial' | 'input'
  onChange?: (value: string) => void
  placeholder?: string
  value?: string
}) => {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const isControlled = value !== undefined
  const [internal, setInternal] = useState<string | undefined>(defaultValue)
  const committed = isControlled ? value : internal
  const [draft, setDraft] = useState<TimeDraft>(() => parseTime(committed))
  const [view, setView] = useState<'dial' | 'input'>(mode)

  const open = () => {
    setDraft(parseTime(committed))
    dialogRef.current?.showModal()
  }
  const close = () => dialogRef.current?.close()

  const apply = () => {
    const next = serializeTime(draft)
    if (!isControlled) {
      setInternal(next)
    }
    onChange?.(next)
    close()
  }

  const display = committed ? formatDisplay(parseTime(committed)) : ''

  return (
    <span className={cx('timepicker', className)}>
      <button className="timepicker-trigger" onClick={open} type="button">
        <Icon name="clock" />
        <span className={cx('timepicker-text', !display && 'timepicker-placeholder')}>
          {display || placeholder}
        </span>
      </button>
      <dialog aria-label={label} className="timepicker-dialog" ref={dialogRef}>
        <span className="timepicker-eyebrow">Uhrzeit wählen</span>
        {view === 'dial' ? (
          <TimeDial draft={draft} setDraft={setDraft} />
        ) : (
          <div className="tp-fields">
            <label className="tp-field">
              <input
                aria-label="Stunde"
                className="tp-input"
                inputMode="numeric"
                onChange={(e) => {
                  const h = Math.max(1, Math.min(12, parseInt(e.target.value || '0', 10) || 1))
                  setDraft((d) => ({ ...d, hour: h }))
                }}
                value={String(draft.hour)}
              />
              <span className="tp-field-label">Stunde</span>
            </label>
            <span className="tp-sep">:</span>
            <label className="tp-field">
              <input
                aria-label="Minute"
                className="tp-input"
                inputMode="numeric"
                onChange={(e) => {
                  const m = Math.max(0, Math.min(59, parseInt(e.target.value || '0', 10) || 0))
                  setDraft((d) => ({ ...d, minute: m }))
                }}
                value={String(draft.minute).padStart(2, '0')}
              />
              <span className="tp-field-label">Minute</span>
            </label>
            <SegmentedButtonSet
              onChange={(v) => setDraft((d) => ({ ...d, period: v as 'am' | 'pm' }))}
              orientation="vertical"
              value={draft.period}
            >
              <SegmentedButton value="am">AM</SegmentedButton>
              <SegmentedButton value="pm">PM</SegmentedButton>
            </SegmentedButtonSet>
          </div>
        )}
        {view === 'dial' ? (
          <SegmentedButtonSet
            className="tp-ampm"
            onChange={(v) => setDraft((d) => ({ ...d, period: v as 'am' | 'pm' }))}
            value={draft.period}
          >
            <SegmentedButton value="am">AM</SegmentedButton>
            <SegmentedButton value="pm">PM</SegmentedButton>
          </SegmentedButtonSet>
        ) : null}
        <div className="timepicker-actions">
          <IconButton
            aria-label={view === 'dial' ? 'Zur Texteingabe' : 'Zum Zifferblatt'}
            icon={view === 'dial' ? 'keyboard' : 'clock'}
            onClick={() => setView((v) => (v === 'dial' ? 'input' : 'dial'))}
          />
          <span className="timepicker-buttons">
            <Button onClick={close} variant="ghost">
              Abbrechen
            </Button>
            <Button onClick={apply} variant="primary">
              OK
            </Button>
          </span>
        </div>
      </dialog>
    </span>
  )
}
