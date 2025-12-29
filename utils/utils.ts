export const getYearsAndMonths = (value: number) => {
  const months = value % 12
  const years = (value - months) / 12

  const yearString = years === 1 ? 'year' : 'years'
  const monthString = months === 1 ? 'month' : 'months'

  if (years > 0) return `${years} ${yearString} and ${months} ${monthString}`
  return `${months} ${monthString}`
}

const currencyOptions: Intl.NumberFormatOptions = {
  style: 'currency',
  currency: 'USD',
}

const currencyFormat = new Intl.NumberFormat('en-US', currencyOptions)

export const formatCurrency = (value: number) => {
  return currencyFormat.format(value)
}

export const normalRound = (value: number) => {
  return Math.round((value + Number.EPSILON) * 100) / 100
}

export const formatCurrencyLarge = (value: number | null): string => {
  if (value === null) return 'N/A'
  if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`
  if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`
  if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`
  return `$${value.toFixed(2)}`
}

export const formatPercent = (value: number | null): string => {
  if (value === null) return 'N/A'
  return `${value.toFixed(2)}%`
}

export const formatBasisPoints = (value: number | null): string => {
  if (value === null) return 'N/A'
  return `${value.toFixed(2)} bps`
}

export const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' })
}

export const formatChartValue = (
  value: number,
  isPercent: boolean = false
): string => {
  if (isPercent) return `${value.toFixed(2)}%`
  if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`
  if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`
  if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`
  return `$${value.toFixed(0)}`
}
