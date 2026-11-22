import React from 'react'

import { periodPill, periodPillOff, periodPillOn } from '../../common/classes'

type PeriodToggleProps<T extends string> = {
  periods: readonly T[]
  value: T
  onChange: (period: T) => void
  label: (period: T) => string
  className?: string
}

function PeriodToggle<T extends string>({
  periods,
  value,
  onChange,
  label,
  className = '',
}: PeriodToggleProps<T>) {
  return (
    <div className={`mb-6 flex flex-wrap gap-2 ${className}`}>
      {periods.map((period) => (
        <button
          key={period}
          type="button"
          onClick={() => {
            if (value !== period) onChange(period)
          }}
          className={`${periodPill} ${value === period ? periodPillOn : periodPillOff}`}
        >
          {label(period)}
        </button>
      ))}
    </div>
  )
}

export default PeriodToggle
