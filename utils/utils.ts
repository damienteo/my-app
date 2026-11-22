export const getYearsAndMonths = (
  value: number,
  t?: (key: string) => string
) => {
  const months = value % 12
  const years = (value - months) / 12

  if (t) {
    // Use translations if provided
    const yearString = years === 1 ? t('year') : t('years')
    const monthString = months === 1 ? t('month') : t('months')
    const and = t('and')

    if (years > 0)
      return `${years} ${yearString} ${and} ${months} ${monthString}`
    return `${months} ${monthString}`
  }

  // Fallback to English if no translation function provided
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
