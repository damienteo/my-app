'use client'

import React, { useState } from 'react'
import { useTranslations } from 'next-intl'
import { ExternalLink, InfoPopup, Paragraph } from '../components/common'
import UserInput from '../components/views/cpfForecast/UserInput'
import Intro from '../components/views/cpfForecast/Intro'
import Results from '../components/views/cpfForecast/Results'
import { FutureValues } from '@/utils/cpf/types'

const CPFForecastPageClient = () => {
  const t = useTranslations('CPFForecastPage')
  const [isCalculating, setCalculating] = useState<boolean>(false)

  const [futureValues, setFutureValues] = useState<FutureValues>({
    monthsTillWithdrawal: 0,
    ordinaryAccount: 0,
    specialAccount: 0,
    retirementAccount: 0,
    ordinaryAccountAtWithdrawalAge: 0,
    specialAccountAtWithdrawalAge: 0,
    history: [],
    historyAfterWithdrawalAge: [],
    monthlySalary: 0,
    salaryHistory: [],
    salaryHistoryAfterWithdrawalAge: [],
  })

  return (
    <div className="flex flex-col max-w-4xl px-4 sm:px-6 mx-auto py-8">
      <div className="mb-6">
        <Intro />
      </div>

      <Paragraph className="mb-4">{t('lastChecked')}</Paragraph>

      <Paragraph className="mb-6">
        {t('frsAssumption.text')}{' '}
        <span className="inline-flex items-center">
          <InfoPopup title={t('frsAssumption.retirementAmounts.title')}>
            <Paragraph className="m-0 mb-2 text-gray-300">
              {t('frsAssumption.retirementAmounts.info')}{' '}
              <ExternalLink
                url="https://www.cpf.gov.sg/member/faq/retirement-income/general-information-on-retirement/what-are-the-retirement-sums-applicable-to-me-"
                label={t('frsAssumption.retirementAmounts.title')}
              />
              .
            </Paragraph>
          </InfoPopup>
        </span>{' '}
        {t('frsAssumption.policyNote')}
      </Paragraph>

      <UserInput
        setCalculating={setCalculating}
        setFutureValues={setFutureValues}
      />

      {isCalculating && <Results futureValues={futureValues} />}
    </div>
  )
}

export default CPFForecastPageClient
