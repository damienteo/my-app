/** Keyboard focus ring used on links, nav, and buttons. */
export const focusRing =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent'

/** Same ring, drawn inside a control that already fills its box. */
export const focusRingInset =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-3px] focus-visible:outline-accent'

/** Rounded surface used by the About cards and the CPF notes. */
export const surfaceCard = 'rounded-2xl bg-surface ring-1 ring-raised'

/** Filled blue control. Size and shape stay with the caller. */
export const blueButton = 'bg-blue-600 text-white hover:bg-blue-500'

/** The main pill on the CPF results. */
export const primaryPill = `${blueButton} rounded-full px-6 py-2.5 font-medium shadow-md transition-all hover:shadow-lg`

/** Shared size for the chart range buttons. */
export const periodPill =
  'rounded-full px-3 py-2 text-sm font-medium transition-colors sm:px-4 sm:text-base'

export const periodPillOn = 'bg-blue-600 text-white shadow-md'

export const periodPillOff = 'bg-gray-700 text-gray-300 hover:bg-gray-600'

/** Inner panel on the price cards and the stock tiles. */
export const raisedPanel = 'rounded-lg bg-gray-700 p-4'

/** Round play control on the animal clips. Position is added by the caller. */
export const accentCircleButton =
  'flex h-14 w-14 items-center justify-center rounded-full bg-accent text-white shadow-lg'
