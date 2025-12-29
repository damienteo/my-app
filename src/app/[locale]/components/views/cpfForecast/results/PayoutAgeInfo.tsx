import React from 'react'
import { useTranslations } from 'next-intl'

import { ExternalLink, InfoPopup, Paragraph } from '../../../common'

import { FutureValues } from '../../../../../../../utils/cpf/types'
import {
  getYearsAndMonths,
  formatCurrency,
} from '../../../../../../../utils/utils'
import { payoutAge } from '../../../../../../../constants'

interface PayoutAgeInfoProps {
  futureValues: FutureValues
}

const PayoutAgeInfo: React.FunctionComponent<PayoutAgeInfoProps> = (props) => {
  const t = useTranslations('CPFForecastPage.results.payoutAge')
  const { futureValues } = props
  const { comparisonValues } = futureValues

  const comparisonSum = comparisonValues
    ? comparisonValues.ordinaryAccount +
      comparisonValues.specialAccount +
      comparisonValues.retirementAccount -
      (futureValues.ordinaryAccount +
        futureValues.specialAccount +
        futureValues.retirementAccount)
    : 0

  return (
    <>
      <Paragraph className="my-6 text-gray-300">
        {t('inTime', {
          time: getYearsAndMonths(futureValues.monthsTillWithdrawal + 120),
          age: payoutAge,
          ordinaryAmount: formatCurrency(futureValues.ordinaryAccount),
          specialAmount: formatCurrency(futureValues.specialAccount),
          retirementAmount: formatCurrency(futureValues.retirementAccount),
        })}
        <InfoPopup title={t('title')}>
          <Paragraph className="text-sm my-6 text-gray-300">
            {t('retirementAccount')}{' '}
            <ExternalLink
              url="https://www.cpf.gov.sg/members/FAQ/schemes/retirement/retirement-sum-scheme/FAQDetails?category=retirement&group=Retirement+Sum+Scheme&ajfaqid=2190582&folderid=18088"
              label={t('retirementAccount')}
            />{' '}
            {t('retirementAccountText')}{' '}
            <ExternalLink
              url="https://www.areyouready.sg/YourInfoHub/Pages/News-3-questions-about-CPF-withdrawals-from-age-55.aspx"
              label={t('transferred')}
            />{' '}
            {t('payouts')}{' '}
            <ExternalLink
              url="https://www.cpf.gov.sg/Members/Schemes/schemes/retirement/cpf-life"
              label={t('monthlyPayouts')}
            />{' '}
            {t('fromAge65')}
          </Paragraph>
          <Paragraph className="text-sm my-6 text-gray-300">
            {t('frsAssumption')}{' '}
            <ExternalLink
              url="https://www.cpf.gov.sg/members/FAQ/schemes/retirement/retirement-sum-scheme/FAQDetails?category=Retirement&group=Retirement+Sum+Scheme&ajfaqid=2190584&folderid=18088"
              label={t('historicalTrends')}
            />
            {t('frsNote')}
          </Paragraph>
        </InfoPopup>
      </Paragraph>
      {comparisonValues && (
        <Paragraph className="my-6 text-gray-300">
          {t('comparison.withoutHousing')}{' '}
          <span className="bg-gray-700 text-blue-200 px-1 rounded">
            {formatCurrency(comparisonValues.ordinaryAccount)}
          </span>{' '}
          {t('comparison.inOrdinaryAccount')}{' '}
          <span className="bg-gray-700 text-blue-200 px-1 rounded">
            {formatCurrency(comparisonValues.specialAccount)}
          </span>{' '}
          {t('comparison.inSpecialAccount')}{' '}
          <span className="bg-gray-700 text-blue-200 px-1 rounded">
            {formatCurrency(comparisonValues.retirementAccount)}
          </span>{' '}
          {t('comparison.inRetirementAccount')}{' '}
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

export default PayoutAgeInfo
