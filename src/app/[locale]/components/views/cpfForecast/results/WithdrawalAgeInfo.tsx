import React from 'react'
import { useTranslations } from 'next-intl'

import { ExternalLink, InfoPopup, Paragraph } from '../../../common'
import { FutureValues } from '../../../../../../../utils/cpf/types'
import {
  getYearsAndMonths,
  formatCurrency,
} from '../../../../../../../utils/utils'
import { withdrawalAge } from '../../../../../../../constants'
import {
  allocationBandsForYear,
  wagePercent,
} from '../../../../../../../utils/cpf/parameters'

interface WithdrawalAgeInfoProps {
  futureValues: FutureValues
}

const WithdrawalAgeInfo: React.FunctionComponent<WithdrawalAgeInfoProps> = (
  props
) => {
  const t = useTranslations('CPFForecastPage.results.withdrawalAge')
  const { futureValues } = props
  const { comparisonValues } = futureValues
  const bands = allocationBandsForYear(2026)

  const comparisonSum = comparisonValues
    ? comparisonValues.ordinaryAccountAtWithdrawalAge +
      comparisonValues.specialAccountAtWithdrawalAge -
      (futureValues.ordinaryAccountAtWithdrawalAge +
        futureValues.specialAccountAtWithdrawalAge)
    : 0

  return (
    <>
      <Paragraph className="mb-6 text-gray-300">
        {t('inTime', {
          time: getYearsAndMonths(
            futureValues.monthsTillWithdrawal,
            (key: string) => t(`time.${key}`)
          ),
          age: withdrawalAge,
          ordinaryAmount: formatCurrency(
            futureValues.ordinaryAccountAtWithdrawalAge
          ),
          specialAmount: formatCurrency(
            futureValues.specialAccountAtWithdrawalAge
          ),
          mediSaveAmount: formatCurrency(
            futureValues.mediSaveAccountAtWithdrawalAge
          ),
        })}
        <InfoPopup title={t('title')}>
          <Paragraph className="text-sm mb-6 text-gray-300">
            {t('interest')}{' '}
            <ExternalLink
              url="https://www.cpf.gov.sg/member/growing-your-savings/earning-higher-returns/earning-attractive-interest"
              label={t('interest')}
            />
            {t('interestText')}
          </Paragraph>
          <Paragraph className="text-sm mb-6 text-gray-300">
            {t('interestRates')}{' '}
            <ExternalLink
              url="https://www.cpf.gov.sg/member/growing-your-savings/earning-higher-returns/earning-attractive-interest"
              label={t('interestRatesLink')}
            />{' '}
            {t('extraInterest')}
          </Paragraph>
          <div className="my-4 overflow-x-auto">
            <table className="min-w-full text-sm text-gray-200">
              <caption className="mb-2 text-left">
                {t('allocationTable')}
              </caption>
              <thead>
                <tr>
                  <th className="px-2 py-1 text-left">{t('allocationAge')}</th>
                  <th className="px-2 py-1 text-right">
                    {t('allocationTotal')}
                  </th>
                  <th className="px-2 py-1 text-right">
                    {t('allocationOrdinary')}
                  </th>
                  <th className="px-2 py-1 text-right">
                    {t('allocationSavings')}
                  </th>
                  <th className="px-2 py-1 text-right">
                    {t('allocationMediSave')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {bands.map((band) => (
                  <tr key={band.id}>
                    <td className="px-2 py-1">{t(`bands.${band.id}`)}</td>
                    <td className="px-2 py-1 text-right">
                      {wagePercent(band.totalRate)}%
                    </td>
                    <td className="px-2 py-1 text-right">
                      {wagePercent(band.totalRate * band.ordinaryRatio)}%
                    </td>
                    <td className="px-2 py-1 text-right">
                      {wagePercent(band.totalRate * band.savingsRatio)}%
                    </td>
                    <td className="px-2 py-1 text-right">
                      {wagePercent(band.totalRate * band.mediSaveRatio)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Paragraph className="text-sm mb-6 text-gray-300">
            {t('allocationNote')}
          </Paragraph>
          <Paragraph className="text-sm mb-6 text-gray-300">
            {t('allocationSource')}{' '}
            <ExternalLink
              url="https://www.cpf.gov.sg/content/dam/web/employer/employer-obligations/documents/CPFAllocationRatesfromJanuary2026.pdf"
              label={t('here')}
            />
            .
          </Paragraph>
        </InfoPopup>
      </Paragraph>
      {comparisonValues && (
        <Paragraph className="mb-6 text-gray-300">
          {t('comparison.withoutHousing')}{' '}
          <span className="bg-gray-700 text-blue-200 px-1 rounded">
            {formatCurrency(comparisonValues.ordinaryAccountAtWithdrawalAge)}
          </span>{' '}
          {t('comparison.inOrdinaryAccount')}{' '}
          <span className="bg-gray-700 text-blue-200 px-1 rounded">
            {formatCurrency(comparisonValues.specialAccountAtWithdrawalAge)}
          </span>{' '}
          {t('comparison.inSpecialAccount')}{' '}
          <span className="bg-gray-700 text-blue-200 px-1 rounded">
            {formatCurrency(Math.abs(comparisonSum))}
          </span>{' '}
          {comparisonSum >= 0 ? t('comparison.more') : t('comparison.less')}{' '}
          {t('comparison.thanSum')}
        </Paragraph>
      )}
    </>
  )
}

export default WithdrawalAgeInfo
