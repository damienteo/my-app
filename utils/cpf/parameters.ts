import { Dayjs } from 'dayjs'
import { normalRound } from '../utils'

/**
 * CPF rules used by the forecast, checked in November 2026.
 *
 * The projection starts from the balances the member enters and only moves
 * forward, so contribution rates are the 1 January 2026 table through
 * December 2026 and the 1 January 2027 table after that. The 2022–2025
 * phase-in is not reconstructed.
 *
 * Sources are cited on the constants they support. Where a later year has
 * not been published, the assumption is named next to the number.
 */

/**
 * Ordinary Account floor. The legislated minimum is 2.5% a year. The rate
 * from 1 October 2026 to 31 December 2026 is the floor.
 * https://www.cpf.gov.sg/member/growing-your-savings/earning-higher-returns/earning-attractive-interest
 */
export const ordinaryAccountAnnualRate = 0.025

/**
 * Special, MediSave and Retirement Account floor. The pegged rate is below
 * the floor, and the floor is extended through 31 December 2027.
 * https://www.cpf.gov.sg/member/growing-your-savings/earning-higher-returns/earning-attractive-interest
 *
 * After 2027 this forecast keeps 4%. That is an assumption: quarterly rates
 * after the published floor are not known.
 */
export const smraAnnualRate = 0.04

/** Extra 1% a year on combined balances that fall inside the $60,000 cap. */
export const extraInterestAnnualRate = 0.01

/**
 * From age 55 the first $30,000 of the extra-interest cap earns 2% extra
 * instead of 1%. The next $30,000 still earns 1%.
 */
export const extraInterestHighAnnualRate = 0.02

export const extraInterestCombinedCap = 60000
export const extraInterestOrdinaryCap = 20000
export const extraInterestHighTier = 30000

/**
 * Annual salary ceiling. Ordinary wages plus additional wages that attract
 * CPF cannot exceed this in a year. It was left unchanged when the monthly
 * ceiling rose.
 * https://www.cpf.gov.sg/member/infohub/news/cpf-related-announcements/budget-highlights-2023
 * https://www.cpf.gov.sg/member/infohub/news/news-releases/cpf-related-changes-taking-place-in-2026-what-you-need-to-know
 */
export const annualSalaryCeiling = 102000

/**
 * Ordinary Wage ceiling for a calendar month.
 *
 * Verified schedule (not $6,800 from September 2025 — that date is not in
 * the official notices; $6,800 applied from 1 January 2024):
 * - 1 Sep 2023: $6,300
 * - 1 Jan 2024: $6,800
 * - 1 Jan 2025: $7,400
 * - 1 Jan 2026: $8,000
 *
 * No increase after 1 January 2026 has been published. Later months stay
 * at $8,000.
 * https://www.cpf.gov.sg/member/infohub/news/cpf-related-announcements/budget-highlights-2023
 * https://www.iras.gov.sg/taxes/individual-income-tax/basics-of-individual-income-tax/tax-reliefs-rebates-and-deductions/tax-reliefs/central-provident-fund(cpf)-relief-for-employees
 */
export const ordinaryWageCeiling = (onDate: Dayjs): number => {
  const year = onDate.year()
  const month = onDate.month()
  if (year < 2023 || (year === 2023 && month < 8)) return 6000
  if (year === 2023) return 6300
  if (year === 2024) return 6800
  if (year === 2025) return 7400
  return 8000
}

/**
 * Additional Wage ceiling for a year in which ordinary wages stay at
 * `monthlyOrdinaryWage` for all 12 months.
 * https://www.cpf.gov.sg/employer/employer-obligations/what-payments-attract-cpf-contributions
 */
export const additionalWageCeiling = (monthlyOrdinaryWage: number): number => {
  return Math.max(0, annualSalaryCeiling - monthlyOrdinaryWage * 12)
}

export const ordinaryWagesSubjectToCpf = (
  monthlySalary: number,
  onDate: Dayjs
): number => {
  if (monthlySalary <= 0) return 0
  return Math.min(monthlySalary, ordinaryWageCeiling(onDate))
}

export interface ContributionBand {
  id: string
  label: string
  /**
   * Highest CPF effective age in this band. Effective age is completed years
   * on the last day of the previous month, so the band changes the month
   * after the birthday.
   */
  maxEffectiveAge: number
  /** Employer + employee rate for monthly wages above $750. */
  totalRate: number
  /** Share of the total contribution credited to the Ordinary Account. */
  ordinaryRatio: number
  /** Share credited to the Special Account, or the Retirement Account from 55. */
  savingsRatio: number
  mediSaveRatio: number
  savingsAccount: 'sa' | 'ra'
}

/**
 * Allocation ratios are shares of the contribution, not of wages.
 * MediSave is computed first, then SA or RA, and the Ordinary Account
 * receives the remainder.
 * https://www.cpf.gov.sg/content/dam/web/employer/employer-obligations/documents/CPFAllocationRatesfromJanuary2026.pdf
 * https://www.cpf.gov.sg/content/dam/web/employer/employer-obligations/documents/jan2027cpfallocationrates.pdf
 *
 * Total rates for wages above $750, from 1 January 2026:
 * https://www.cpf.gov.sg/member/cpf-overview
 * https://www.cpf.gov.sg/content/dam/web/employer/employer-obligations/documents/CPFcontributionratesfrom1Jan2026.pdf
 *
 * From 1 January 2027 the increase for ages above 55 to 65 is allocated to
 * the Retirement Account:
 * https://www.cpf.gov.sg/employer/infohub/news/cpf-related-announcements/new-contribution-rates
 *
 * The long-term target (about 37% for ages above 55 to 60, around 2030) is
 * published only as a target. The years 2028 and 2029 are not published, so
 * this forecast keeps the 1 January 2027 rates after 2027.
 * https://sprs.parl.gov.sg/search/search/download?value=20260212%2Fannex-Annex+E-4.pdf
 *
 * Wages of $750 or below use graduated rates. This forecast applies the full
 * age-band rate to every wage and so overstates contributions below $750.
 */
const below55Bands: ContributionBand[] = [
  {
    id: '35AndBelow',
    label: '35 and below',
    maxEffectiveAge: 34,
    totalRate: 0.37,
    ordinaryRatio: 0.6217,
    savingsRatio: 0.1621,
    mediSaveRatio: 0.2162,
    savingsAccount: 'sa',
  },
  {
    id: 'above35to45',
    label: 'Above 35 to 45',
    maxEffectiveAge: 44,
    totalRate: 0.37,
    ordinaryRatio: 0.5677,
    savingsRatio: 0.1891,
    mediSaveRatio: 0.2432,
    savingsAccount: 'sa',
  },
  {
    id: 'above45to50',
    label: 'Above 45 to 50',
    maxEffectiveAge: 49,
    totalRate: 0.37,
    ordinaryRatio: 0.5136,
    savingsRatio: 0.2162,
    mediSaveRatio: 0.2702,
    savingsAccount: 'sa',
  },
  {
    id: 'above50to55',
    label: 'Above 50 to 55',
    maxEffectiveAge: 54,
    totalRate: 0.37,
    ordinaryRatio: 0.4055,
    savingsRatio: 0.3108,
    mediSaveRatio: 0.2837,
    savingsAccount: 'sa',
  },
]

const seniorFrom2026: ContributionBand[] = [
  {
    id: 'above55to60',
    label: 'Above 55 to 60',
    maxEffectiveAge: 59,
    totalRate: 0.34,
    ordinaryRatio: 0.353,
    savingsRatio: 0.3382,
    mediSaveRatio: 0.3088,
    savingsAccount: 'ra',
  },
  {
    id: 'above60to65',
    label: 'Above 60 to 65',
    maxEffectiveAge: 64,
    totalRate: 0.25,
    ordinaryRatio: 0.14,
    savingsRatio: 0.44,
    mediSaveRatio: 0.42,
    savingsAccount: 'ra',
  },
  {
    id: 'above65to70',
    label: 'Above 65 to 70',
    maxEffectiveAge: 69,
    totalRate: 0.165,
    ordinaryRatio: 0.0607,
    savingsRatio: 0.303,
    mediSaveRatio: 0.6363,
    savingsAccount: 'ra',
  },
  {
    id: 'above70',
    label: 'Above 70',
    maxEffectiveAge: 200,
    totalRate: 0.125,
    ordinaryRatio: 0.08,
    savingsRatio: 0.08,
    mediSaveRatio: 0.84,
    savingsAccount: 'ra',
  },
]

const seniorFrom2027: ContributionBand[] = [
  {
    id: 'above55to60',
    label: 'Above 55 to 60',
    maxEffectiveAge: 59,
    totalRate: 0.355,
    ordinaryRatio: 0.3382,
    savingsRatio: 0.3661,
    mediSaveRatio: 0.2957,
    savingsAccount: 'ra',
  },
  {
    id: 'above60to65',
    label: 'Above 60 to 65',
    maxEffectiveAge: 64,
    totalRate: 0.26,
    ordinaryRatio: 0.1347,
    savingsRatio: 0.4615,
    mediSaveRatio: 0.4038,
    savingsAccount: 'ra',
  },
  seniorFrom2026[2],
  seniorFrom2026[3],
]

export const allocationBandsForYear = (year: number): ContributionBand[] => {
  const senior = year >= 2027 ? seniorFrom2027 : seniorFrom2026
  return [...below55Bands, ...senior]
}

export const contributionBand = (
  onDate: Dayjs,
  effectiveAge: number
): ContributionBand => {
  const bands = allocationBandsForYear(onDate.year())
  const match = bands.find((band) => effectiveAge <= band.maxEffectiveAge)
  return match ?? bands[bands.length - 1]
}

/**
 * Completed years on the last day of the previous month.
 *
 * A member who turns 35 on 13 January 2026 stays in "35 and below" for
 * January and moves to "Above 35 to 45" in February.
 * https://ask.gov.sg/cpf/questions/cm0f52kvp0005pz7akk2ymqfy
 */
export const cpfEffectiveAge = (birthDate: Dayjs, onDate: Dayjs): number => {
  const lastDayOfPreviousMonth = onDate.startOf('month').subtract(1, 'day')
  return lastDayOfPreviousMonth.diff(birthDate, 'year')
}

/**
 * How many times a month-by-month loop must advance to land on the birthday
 * month of `targetAge`. Zero when that month is the current month or earlier,
 * because the current partial month is not simulated.
 */
export const monthsUntilBirthdayMonth = (
  birthDate: Dayjs,
  from: Dayjs,
  targetAge: number
): number => {
  const birthday = birthDate.add(targetAge, 'year')
  const birthdayHasArrived =
    from.year() > birthday.year() ||
    (from.year() === birthday.year() && from.month() >= birthday.month())
  if (birthdayHasArrived) return 0

  let cursor = from
  let steps = 0
  const limit = (targetAge + 1) * 12
  while (steps < limit) {
    cursor = cursor.add(1, 'month')
    steps += 1
    if (
      cursor.year() === birthday.year() &&
      cursor.month() === birthday.month()
    ) {
      return steps
    }
  }
  return steps
}

export interface ContributionSplit {
  ordinary: number
  special: number
  retirement: number
  mediSave: number
  total: number
}

/**
 * Total contribution is rounded to the nearest dollar. MediSave and the
 * SA/RA share are rounded to the cent. The Ordinary Account is the remainder.
 * https://www.cpf.gov.sg/content/dam/web/employer/employer-obligations/documents/CPFcontributionratesfrom1Jan2026.pdf
 */
export const splitContribution = (
  eligibleWage: number,
  band: ContributionBand
): ContributionSplit => {
  if (eligibleWage <= 0) {
    return { ordinary: 0, special: 0, retirement: 0, mediSave: 0, total: 0 }
  }

  const total = Math.round(eligibleWage * band.totalRate)
  const mediSave = normalRound(total * band.mediSaveRatio)
  const savings = normalRound(total * band.savingsRatio)
  const ordinary = normalRound(total - mediSave - savings)

  if (band.savingsAccount === 'sa') {
    return { ordinary, special: savings, retirement: 0, mediSave, total }
  }
  return { ordinary, special: 0, retirement: savings, mediSave, total }
}

export interface RetirementSums {
  brs: number
  frs: number
  ers: number
}

/**
 * Published cohort sums. BRS and FRS are fixed in the year a member turns 55.
 * From 2025 the Enhanced Retirement Sum is 4 times the BRS (it was 3 times).
 * The ERS is a top-up ceiling and is not what this forecast sets aside.
 * https://www.cpf.gov.sg/member/infohub/educational-resources/what-is-the-cpf-retirement-sum
 * https://www.cpf.gov.sg/content/dam/web/member/retirement-income/documents/RetirementSum.pdf
 */
const publishedRetirementSums: Record<number, RetirementSums> = {
  2024: { brs: 102900, frs: 205800, ers: 308700 },
  2025: { brs: 106500, frs: 213000, ers: 426000 },
  2026: { brs: 110200, frs: 220400, ers: 440800 },
  2027: { brs: 114100, frs: 228200, ers: 456400 },
}

const lastPublishedCohort = 2027

/** Cohorts after the last published year use the 3.5% projection. */
export const isProjectedRetirementCohort = (yearTurning55: number) => {
  return yearTurning55 > lastPublishedCohort
}

/**
 * After 2027, grow the 2027 Basic Retirement Sum by 3.5% a year and round to
 * the nearest $100. FRS stays at 2 times BRS and ERS at 4 times BRS.
 * 3.5% matches the published 2025–2027 pace. It is not a published figure
 * for those later cohorts.
 */
const brsGrowthAfterPublishedCohorts = 0.035

export const retirementSumsForCohort = (
  yearTurning55: number
): RetirementSums => {
  if (yearTurning55 <= 2024) return publishedRetirementSums[2024]
  const published = publishedRetirementSums[yearTurning55]
  if (published) return published

  let brs = publishedRetirementSums[lastPublishedCohort].brs
  for (let year = lastPublishedCohort + 1; year <= yearTurning55; year += 1) {
    brs = Math.round((brs * (1 + brsGrowthAfterPublishedCohorts)) / 100) * 100
  }
  return { brs, frs: brs * 2, ers: brs * 4 }
}

/**
 * Basic Healthcare Sum by calendar year, for members who have not yet turned
 * 65. The year a member turns 65 fixes that year's BHS for life.
 *
 * Published cohort amounts (the prevailing BHS that year):
 * https://ask.gov.sg/cpf/questions/cm4kkdms5000u3dsmhy7ep0q7
 * https://www.cpf.gov.sg/member/infohub/news/news-releases/cpf-interest-rates-from-1-january-to-31-march-2026-and-basic-healthcare-sum-for-2026
 *
 * 2027 had not been published when these figures were checked (November 2026;
 * the 2026 BHS was announced on 15 December 2025). From 2027 this forecast
 * repeats the latest published step, +$3,500 a year. That is an assumption.
 */
const publishedBasicHealthcareSum: Record<number, number> = {
  2016: 49800,
  2017: 52000,
  2018: 54500,
  2019: 57200,
  2020: 60000,
  2021: 63000,
  2022: 66000,
  2023: 68500,
  2024: 71500,
  2025: 75500,
  2026: 79000,
}

const lastPublishedBhsYear = 2026
const bhsAnnualIncreaseAfterPublished = 3500

export const basicHealthcareSumForYear = (year: number): number => {
  if (year <= 2016) return publishedBasicHealthcareSum[2016]
  const published = publishedBasicHealthcareSum[year]
  if (published) return published
  return (
    publishedBasicHealthcareSum[lastPublishedBhsYear] +
    (year - lastPublishedBhsYear) * bhsAnnualIncreaseAfterPublished
  )
}

export const basicHealthcareSumForMember = (
  year: number,
  yearTurning65: number
): number => {
  return basicHealthcareSumForYear(Math.min(year, yearTurning65))
}

export interface AccountBalances {
  ordinary: number
  special: number
  mediSave: number
  retirement: number
}

export interface MonthlyInterest extends AccountBalances {}

const monthlySlice = (amount: number, annualRate: number): number => {
  return normalRound(amount * (annualRate / 12))
}

/**
 * Interest for one month, before it is credited.
 *
 * CPF computes interest monthly on the lowest balance in the month and
 * credits it at the end of the year. This uses annual rate / 12 and rounds
 * each slice to the cent, so twelve identical months can differ by a few
 * cents from annual rate × balance.
 *
 * Extra interest fills combined balances in this order: Retirement Account,
 * Ordinary Account up to $20,000, Special Account, then MediSave. Extra
 * interest earned on the Ordinary Account is credited to the Special Account
 * before 55 and to the Retirement Account from 55. Extra interest on the
 * other accounts stays in that account.
 * https://www.cpf.gov.sg/member/infohub/news/news-releases/cpf-interest-rates-from-1-january-to-31-march-2026-and-basic-healthcare-sum-for-2026
 * https://www.cpf.gov.sg/member/growing-your-savings/earning-higher-returns/earning-attractive-interest
 */
export const monthlyInterest = (
  balances: AccountBalances,
  aged55OrAbove: boolean
): MonthlyInterest => {
  const interest: MonthlyInterest = {
    ordinary: monthlySlice(
      Math.max(0, balances.ordinary),
      ordinaryAccountAnnualRate
    ),
    special: monthlySlice(Math.max(0, balances.special), smraAnnualRate),
    mediSave: monthlySlice(Math.max(0, balances.mediSave), smraAnnualRate),
    retirement: monthlySlice(Math.max(0, balances.retirement), smraAnnualRate),
  }

  const chunks: { key: keyof AccountBalances; amount: number }[] = [
    { key: 'retirement', amount: Math.max(0, balances.retirement) },
    {
      key: 'ordinary',
      amount: Math.min(
        Math.max(0, balances.ordinary),
        extraInterestOrdinaryCap
      ),
    },
    { key: 'special', amount: Math.max(0, balances.special) },
    { key: 'mediSave', amount: Math.max(0, balances.mediSave) },
  ]

  let used = 0
  let remaining = extraInterestCombinedCap
  chunks.forEach((chunk) => {
    if (remaining <= 0 || chunk.amount <= 0) return
    const take = Math.min(chunk.amount, remaining)
    let high = 0
    let low = take
    if (aged55OrAbove) {
      const highRoom = Math.max(0, extraInterestHighTier - used)
      high = Math.min(take, highRoom)
      low = take - high
    }

    const extra = normalRound(
      (high > 0 ? monthlySlice(high, extraInterestHighAnnualRate) : 0) +
        (low > 0 ? monthlySlice(low, extraInterestAnnualRate) : 0)
    )

    if (chunk.key === 'ordinary') {
      if (aged55OrAbove) {
        interest.retirement = normalRound(interest.retirement + extra)
      } else {
        interest.special = normalRound(interest.special + extra)
      }
    } else {
      interest[chunk.key] = normalRound(interest[chunk.key] + extra)
    }

    used += take
    remaining -= take
  })

  return interest
}

/** Percent of wages, rounded to one decimal, for the on-screen table. */
export const wagePercent = (rate: number): string => {
  const percent = Math.round(rate * 1000) / 10
  return Number.isInteger(percent) ? String(percent) : percent.toFixed(1)
}
