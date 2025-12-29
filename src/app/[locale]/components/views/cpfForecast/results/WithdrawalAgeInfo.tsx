import React from 'react'
import { useTranslations } from 'next-intl'

import { ExternalLink, InfoPopup, Paragraph } from '../../../common'
import { FutureValues } from '../../../../../../../utils/cpf/types'
import {
  getYearsAndMonths,
  formatCurrency,
} from '../../../../../../../utils/utils'
import { withdrawalAge } from '../../../../../../../constants'

interface WithdrawalAgeInfoProps {
  futureValues: FutureValues
}

const WithdrawalAgeInfo: React.FunctionComponent<WithdrawalAgeInfoProps> = (
  props
) => {
  const t = useTranslations('CPFForecastPage.results.withdrawalAge')
  const { futureValues } = props
  const { comparisonValues } = futureValues

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
        })}
        <InfoPopup title={t('title')}>
          <Paragraph className="text-sm mb-6 text-gray-300">
            {t('interest')}{' '}
            <ExternalLink
              url="https://www.cpf.gov.sg/members/FAQ/schemes/other-matters/others/FAQDetails?category=other+matters&group=Others&ajfaqid=2192131&folderid=13726"
              label={t('interest')}
            />
            {t('interestText')}
          </Paragraph>
          <Paragraph className="text-sm mb-6 text-gray-300">
            {t('interestRates')}{' '}
            <ExternalLink
              url="https://www.cpf.gov.sg/Members/AboutUs/about-us-info/cpf-interest-rates"
              label={t('interestRatesLink')}
            />{' '}
            {t('extraInterest')}
          </Paragraph>
          <img
            src="/TableC1_AllocationRates.png"
            alt={t('allocationTable')}
            className="w-full h-auto"
          />
          <Paragraph className="text-sm mb-6 text-gray-300">
            {t('allocationSource')}{' '}
            <ExternalLink
              url="https://www.cpf.gov.sg/Employers/EmployerGuides/employer-guides/paying-cpf-contributions/cpf-contribution-and-allocation-rates"
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
