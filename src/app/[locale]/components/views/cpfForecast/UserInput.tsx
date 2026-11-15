import React, { useState } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import dayjs, { Dayjs } from 'dayjs'
import { CurrencyInput, ExternalLink, InfoPopup, Section } from '../../common'
import {
  calculateFutureValues,
  roundTo2Dec,
} from '../../../../../../utils/cpf/cpfForecast'
import {
  ErrorValues,
  Values,
  AccountValues,
  FutureValues,
} from '../../../../../../utils/cpf/types'
import { cpfAccounts, withdrawalAge } from '../../../../../../constants'
import * as gtag from '../../../../../../lib/gtag'

interface UserInputProps {
  setCalculating: (isCalculating: boolean) => void
  setFutureValues: (values: FutureValues) => void
}

const minDate = dayjs().subtract(withdrawalAge, 'y')
const maxDate = dayjs().subtract(16, 'y')

const inputClass =
  'block w-full rounded-md border border-gray-600 bg-gray-800 px-3 py-2 font-mono text-sm tabular-nums text-gray-200 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500'

const UserInput: React.FunctionComponent<UserInputProps> = (props) => {
  const t = useTranslations('CPFForecastPage.userInput')
  const locale = useLocale()
  const { setFutureValues, setCalculating } = props
  const monthLocale = locale === 'jp' ? 'ja' : 'en'
  const monthNames = Array.from({ length: 12 }, (_, index) =>
    new Date(2026, index, 1).toLocaleString(monthLocale, { month: 'long' })
  )

  const [values, setValues] = useState<Values>({
    ordinaryAccount: '0',
    specialAccount: '0',
    mediSaveAccount: '0',
    monthlySalary: '0',
    monthsOfBonus: '0',
    bonusMonth: '0',
    salaryIncreaseRate: '0',
    housingLumpSum: '0',
    housingMonthlyPayment: '0',
    housingLoanTenure: '0',
  })
  const [selectedDate, handleDateChange] = useState<Dayjs | null>(maxDate)
  const [housingLumpSumDate, handleHousingLumpSumDateChange] =
    useState<Dayjs>(dayjs())
  const [housingLoanDate, handleHousingLoanDateChange] =
    useState<Dayjs>(dayjs())
  const [specialAccountOnly, setSpecialAccountOnly] = useState<boolean>(false)
  const [errors, setErrors] = useState<ErrorValues>({})
  const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false)

  const dateError = (date: Dayjs) => {
    if (!date.isValid()) return t('errors.dateRequired')
    if (date.isBefore(dayjs().startOf('month'), 'month')) {
      return t('errors.dateInPast')
    }
    return undefined
  }

  const validateValues = () => {
    const nextErrors = {} as ErrorValues
    Object.keys(values).map((field: string) => {
      if (parseFloat(values[field]) < 0) {
        nextErrors[field] = t('errors.negativeValue')
      } else {
        nextErrors[field] = undefined
      }
    })

    if (specialAccountOnly === true && parseFloat(values.housingLumpSum) > 0) {
      nextErrors.specialAccountOnly = t('errors.specialAccountOnly')
    }

    const lumpSum = parseFloat(values.housingLumpSum)
    if (lumpSum > 0) {
      nextErrors.housingLumpSumDate = dateError(housingLumpSumDate)
    }

    const monthlyPayment = parseFloat(values.housingMonthlyPayment)
    if (monthlyPayment > 0) {
      if (!(parseFloat(values.housingLoanTenure) > 0)) {
        nextErrors.housingLoanTenure = t('errors.tenureRequired')
      }
      nextErrors.housingLoanDate = dateError(housingLoanDate)
    }

    setErrors({ ...nextErrors })

    return nextErrors
  }

  const handleChange =
    (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
      const nextValue = roundTo2Dec(event.target.value)
      setValues({ ...values, [field]: nextValue })
      const nextErrors = { ...errors }
      nextErrors[field] = undefined
      setErrors({ ...nextErrors })
    }

  const handleSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSpecialAccountOnly(event.target.checked)
  }

  const handleDropdownChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const nextValues = { ...values }
    nextValues.bonusMonth = event.target.value
    setValues(nextValues)
  }

  const handleSubmit = () => {
    const nextErrors = validateValues()

    gtag.event({
      action: 'submit_form',
      category: 'CPF-Forecast',
      label: 'submission',
    })

    const isCorrectInput = Object.values(nextErrors).every(
      (el) => el === undefined
    )

    // Replace empty strings with 0
    const nextValues = {} as Values
    Object.keys(values).map((key) => {
      return (nextValues[key] = values[key] === '' ? '0' : values[key])
    })

    const accountValues = {
      ...nextValues,
      selectedDate,
      housingLumpSumDate,
      housingLoanDate,
      specialAccountOnly,
    } as AccountValues

    if (isCorrectInput) {
      setCalculating(false)
      const nextFutureValues = calculateFutureValues(accountValues)
      setFutureValues(nextFutureValues)

      if (Object.values(nextFutureValues.errors).length > 0) {
        setErrors({ ...nextFutureValues.errors })
      } else {
        setFutureValues(nextFutureValues)
        setCalculating(true)
        setSnackbarOpen(true)
      }
    }
  }

  const handleSnackbarClose = () => {
    setSnackbarOpen(false)
  }

  return (
    <>
      <Section>
        <p className="text-gray-300 mb-4 text-justify hyphens-auto">
          {t('accountBalances.instruction')}{' '}
          <span className="inline-flex items-center">
            <InfoPopup title={t('accountBalances.infoPopup.title')}>
              <p className="text-gray-300">
                {t('accountBalances.infoPopup.text')}{' '}
                <ExternalLink
                  url="https://www.cpf.gov.sg/member/cpf-overview"
                  label="CPF"
                />
                .
              </p>
            </InfoPopup>
          </span>
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {cpfAccounts.map((account) => (
            <div key={account.field}>
              <CurrencyInput
                value={values[account.field]}
                label={t(`accountBalances.${account.field}`)}
                field={account.field}
                error={Boolean(errors[account.field])}
                helperText={errors[account.field]}
                handleChange={handleChange}
              />
            </div>
          ))}
        </div>
      </Section>
      <Section>
        <p className="text-gray-300 mb-4 text-justify hyphens-auto">
          {t('dateOfBirth.instruction')}{' '}
          <span className="inline-flex items-center">
            <InfoPopup title={t('dateOfBirth.withdrawalInfo.title')}>
              <p className="text-gray-300">
                {t('dateOfBirth.withdrawalInfo.text', { age: withdrawalAge })}{' '}
                <ExternalLink
                  url="https://www.cpf.gov.sg/member/infohub/educational-resources/heres-what-cpf-members-are-doing-with-their-cash-withdrawals-after-age-55"
                  label={t('dateOfBirth.withdrawalInfo.here')}
                />
                .
              </p>
            </InfoPopup>
          </span>
        </p>
        <div className="w-full min-w-0 max-w-md">
          <label className="block text-sm font-medium text-gray-300 mb-1">
            {t('dateOfBirth.label')}
          </label>
          <input
            type="date"
            value={selectedDate?.format('YYYY-MM-DD')}
            onChange={(e) => handleDateChange(dayjs(e.target.value))}
            className="cpf-date box-border block w-full min-w-0 max-w-full appearance-none font-mono text-sm tabular-nums rounded-md bg-gray-800 text-gray-200 border border-gray-600 focus:border-blue-500 focus:ring-blue-500 focus:outline-none focus:ring-2 py-2 px-3"
          />
        </div>
      </Section>
      <Section>
        <p className="text-gray-300 mb-4 text-justify hyphens-auto">
          {t('salary.instruction')}{' '}
          <span className="inline-flex items-center">
            <InfoPopup title={t('salary.contributionInfo.title')}>
              <p className="text-gray-300">
                <ExternalLink
                  url="https://www.cpf.gov.sg/employer/employer-obligations/how-much-cpf-contributions-to-pay"
                  label={t('salary.contributionInfo.when55')}
                />
                {t('salary.contributionInfo.employerContribution')}
              </p>
              <p className="text-gray-300 mt-3">
                {t('salary.contributionInfo.owCeilingText')}{' '}
                <ExternalLink
                  url="https://www.cpf.gov.sg/member/infohub/news/cpf-related-announcements/budget-highlights-2023"
                  label={t('salary.contributionInfo.owCeiling')}
                />
                .
              </p>
            </InfoPopup>
          </span>
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <CurrencyInput
              value={values.monthlySalary}
              label={t('salary.monthlySalary')}
              field="monthlySalary"
              error={Boolean(errors.monthlySalary)}
              helperText={errors.monthlySalary}
              handleChange={handleChange}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              {t('salary.salaryIncrease')}
            </label>
            <input
              type="number"
              value={values.salaryIncreaseRate}
              onChange={handleChange('salaryIncreaseRate')}
              className="block w-full sm:text-sm rounded-md bg-gray-800 text-gray-200 border border-gray-600 focus:border-blue-500 focus:ring-blue-500 focus:outline-none focus:ring-2 py-2 px-3 placeholder-gray-500"
              placeholder={t('salary.salaryIncreasePlaceholder')}
            />
          </div>
        </div>
      </Section>

      <details className="group mb-6 rounded-2xl bg-surface text-gray-300 ring-1 ring-raised">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-4 text-sm font-medium text-ink sm:px-6 [&::-webkit-details-marker]:hidden">
          <span>{t('optional.summary')}</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
            className="h-5 w-5 shrink-0 text-accent transition-transform group-open:rotate-180"
          >
            <path
              fillRule="evenodd"
              d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.17l3.71-3.94a.75.75 0 1 1 1.08 1.04l-4.25 4.5a.75.75 0 0 1-1.08 0l-4.25-4.5a.75.75 0 0 1 .02-1.06Z"
              clipRule="evenodd"
            />
          </svg>
        </summary>
        <div className="space-y-8 border-t border-raised px-4 py-5 sm:px-6">
          <div>
            <p className="mb-3 text-sm leading-relaxed">
              {t('optional.bonusTitle')}{' '}
              <InfoPopup title={t('optional.bonusInfoTitle')}>
                <p className="text-sm text-gray-300">
                  {t('optional.bonusInfoBefore')}{' '}
                  <ExternalLink
                    url="https://www.cpf.gov.sg/employer/faq/employer-obligations/what-payments-attract-cpf-contributions/how-do-i-calculate-the-additional-wage--aw--ceiling-and-the-amou"
                    label={t('optional.bonusInfoLink')}
                  />{' '}
                  {t('optional.bonusInfoAfter')}
                </p>
              </InfoPopup>
            </p>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label
                  htmlFor="months-of-bonus"
                  className="mb-1 block text-sm font-medium text-gray-300"
                >
                  {t('optional.monthsOfBonus')}
                </label>
                <div className="relative">
                  <input
                    id="months-of-bonus"
                    type="number"
                    min="0"
                    value={values.monthsOfBonus}
                    onChange={handleChange('monthsOfBonus')}
                    className={`${inputClass} pr-16`}
                  />
                  <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-sm text-gray-400">
                    {t('optional.monthsSuffix')}
                  </span>
                </div>
                {errors.monthsOfBonus && (
                  <p className="mt-2 text-sm text-red-400">
                    {errors.monthsOfBonus}
                  </p>
                )}
              </div>
              <div>
                <label
                  htmlFor="bonus-month"
                  className="mb-1 block text-sm font-medium text-gray-300"
                >
                  {t('optional.bonusMonth')}
                </label>
                <select
                  id="bonus-month"
                  value={values.bonusMonth}
                  onChange={handleDropdownChange}
                  className={inputClass}
                >
                  {monthNames.map((name, index) => (
                    <option key={name} value={String(index)}>
                      {name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div>
            <p className="mb-3 text-sm leading-relaxed">
              {t('optional.lumpSumTitle')}{' '}
              <InfoPopup title={t('optional.housingInfoTitle')}>
                <p className="text-sm text-gray-300">
                  {t('optional.housingLumpInfo')}{' '}
                  <ExternalLink
                    url="https://www.cpf.gov.sg/member/home-ownership/using-your-cpf-to-buy-a-home"
                    label={t('optional.housingScheme')}
                  />
                  .
                </p>
              </InfoPopup>
            </p>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <CurrencyInput
                value={values.housingLumpSum}
                label={t('optional.lumpSum')}
                field="housingLumpSum"
                error={Boolean(errors.housingLumpSum)}
                helperText={errors.housingLumpSum}
                handleChange={handleChange}
              />
              <div>
                <label
                  htmlFor="lump-sum-date"
                  className="mb-1 block text-sm font-medium text-gray-300"
                >
                  {t('optional.lumpSumDate')}
                </label>
                <input
                  id="lump-sum-date"
                  type="date"
                  min={dayjs().format('YYYY-MM-DD')}
                  value={
                    housingLumpSumDate.isValid()
                      ? housingLumpSumDate.format('YYYY-MM-DD')
                      : ''
                  }
                  onChange={(event) =>
                    handleHousingLumpSumDateChange(
                      event.target.value ? dayjs(event.target.value) : dayjs('')
                    )
                  }
                  className={`cpf-date ${inputClass}`}
                />
                {errors.housingLumpSumDate && (
                  <p className="mt-2 text-sm text-red-400">
                    {errors.housingLumpSumDate}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div>
            <p className="mb-3 text-sm leading-relaxed">
              {t('optional.loanTitle')}{' '}
              <InfoPopup title={t('optional.housingInfoTitle')}>
                <p className="text-sm text-gray-300">
                  {t('optional.housingLoanInfo')}{' '}
                  <ExternalLink
                    url="https://www.cpf.gov.sg/member/home-ownership/using-your-cpf-to-buy-a-home"
                    label={t('optional.housingScheme')}
                  />
                  .
                </p>
              </InfoPopup>
            </p>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <CurrencyInput
                value={values.housingMonthlyPayment}
                label={t('optional.monthlyPayment')}
                field="housingMonthlyPayment"
                error={Boolean(errors.housingMonthlyPayment)}
                helperText={errors.housingMonthlyPayment}
                handleChange={handleChange}
              />
              <div>
                <label
                  htmlFor="loan-tenure"
                  className="mb-1 block text-sm font-medium text-gray-300"
                >
                  {t('optional.tenure')}
                </label>
                <div className="relative">
                  <input
                    id="loan-tenure"
                    type="number"
                    min="0"
                    value={values.housingLoanTenure}
                    onChange={handleChange('housingLoanTenure')}
                    className={`${inputClass} pr-16`}
                  />
                  <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-sm text-gray-400">
                    {t('optional.yearsSuffix')}
                  </span>
                </div>
                {errors.housingLoanTenure && (
                  <p className="mt-2 text-sm text-red-400">
                    {errors.housingLoanTenure}
                  </p>
                )}
              </div>
              <div>
                <label
                  htmlFor="loan-date"
                  className="mb-1 block text-sm font-medium text-gray-300"
                >
                  {t('optional.loanDate')}
                </label>
                <input
                  id="loan-date"
                  type="date"
                  min={dayjs().format('YYYY-MM-DD')}
                  value={
                    housingLoanDate.isValid()
                      ? housingLoanDate.format('YYYY-MM-DD')
                      : ''
                  }
                  onChange={(event) =>
                    handleHousingLoanDateChange(
                      event.target.value ? dayjs(event.target.value) : dayjs('')
                    )
                  }
                  className={`cpf-date ${inputClass}`}
                />
                {errors.housingLoanDate && (
                  <p className="mt-2 text-sm text-red-400">
                    {errors.housingLoanDate}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div>
            <p className="mb-3 text-sm leading-relaxed">
              {t('optional.saTitle')}{' '}
              <InfoPopup title={t('optional.saInfoTitle')}>
                <p className="text-sm text-gray-300">
                  {t('optional.saInfoBefore')}{' '}
                  <ExternalLink
                    url="https://www.cpf.gov.sg/eSvc/Web/Schemes/OAToSATransfer/FundTransferRequest"
                    label={t('optional.saInfoLink')}
                  />{' '}
                  {t('optional.saInfoAfter')}
                </p>
              </InfoPopup>
            </p>
            <label className="flex items-start gap-3 text-sm leading-relaxed">
              <input
                type="checkbox"
                checked={specialAccountOnly}
                onChange={handleSelect}
                name="specialAccountOnly"
                className="mt-1 h-4 w-4 accent-[#1761ff]"
              />
              <span>{t('optional.saLabel')}</span>
            </label>
            {errors.specialAccountOnly && (
              <p className="mt-2 text-sm text-red-400">
                {errors.specialAccountOnly}
              </p>
            )}
          </div>
        </div>
      </details>

      <div className="mt-4 mb-6">
        <button
          className="bg-blue-600 hover:bg-blue-500 text-white py-3 px-8 rounded-full transition-all font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
          onClick={handleSubmit}
        >
          {t('submit')}
        </button>
      </div>

      {snackbarOpen && (
        <div className="fixed bottom-4 right-4 bg-green-600 text-white p-3 rounded shadow-lg z-50">
          <span>{t('success')}</span>
          <button
            className="ml-2 text-white hover:text-gray-200"
            onClick={handleSnackbarClose}
          >
            &times;
          </button>
        </div>
      )}
    </>
  )
}

export default UserInput
