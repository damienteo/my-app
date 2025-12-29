import React, { useState } from 'react'
import { useTranslations } from 'next-intl'

import { Section } from '../../common'
import HistoryTable from './results/HistoryTable'
import WithdrawalAgeInfo from './results/WithdrawalAgeInfo'
import PayoutAgeInfo from './results/PayoutAgeInfo'

import { FutureValues } from '@/utils/cpf/types'

interface ResultsProps {
  futureValues: FutureValues
}

const Results: React.FunctionComponent<ResultsProps> = (props) => {
  const t = useTranslations('CPFForecastPage.results')
  const { futureValues } = props
  const {
    history,
    monthlySalary,
    historyAfterWithdrawalAge,
    salaryHistory,
    salaryHistoryAfterWithdrawalAge,
  } = futureValues

  const [historyOpen, setHistoryOpen] = useState<boolean>(false)
  const [historyAfterWithdrawalAgeOpen, setHistoryAfterWithdrawalAgeOpen] =
    useState<boolean>(false)

  return (
    <>
      {/* OA and SA during Withdrawal Age (55)*/}
      <Section>
        <WithdrawalAgeInfo futureValues={futureValues} />

        {/* History Table for Transactions up to 55 years old */}
        {history.length > 0 && (
          <div className="text-center my-6">
            <button
              className="bg-blue-600 hover:bg-blue-500 text-white py-2.5 px-6 rounded-full transition-all font-medium shadow-md hover:shadow-lg"
              onClick={() => setHistoryOpen(!historyOpen)}
            >
              {historyOpen
                ? t('hideCalculationsTill55')
                : t('showCalculationsTill55')}
            </button>
          </div>
        )}
        {historyOpen && (
          <>
            <HistoryTable
              data={history}
              groupByYear={monthlySalary > 0}
              salaryData={salaryHistory}
            />
            <div className="text-center my-6">
              <button
                className="bg-cyan-800 hover:bg-cyan-600 text-white py-2 px-4 rounded"
                onClick={() => setHistoryOpen(!historyOpen)}
              >
                {historyOpen ? 'Hide' : 'Show'} Calculations Till 55!
              </button>
            </div>
          </>
        )}
      </Section>

      {/* OA and SA during Retirement Age (65)*/}
      <Section>
        <PayoutAgeInfo futureValues={futureValues} />

        {/* History Table for Transactions from 55 to 65 years old */}
        {historyAfterWithdrawalAge.length > 0 && (
          <div className="text-center my-6">
            <button
              className="bg-blue-600 hover:bg-blue-500 text-white py-2.5 px-6 rounded-full transition-all font-medium shadow-md hover:shadow-lg"
              onClick={() =>
                setHistoryAfterWithdrawalAgeOpen(!historyAfterWithdrawalAgeOpen)
              }
            >
              {historyAfterWithdrawalAgeOpen
                ? t('hideCalculationsAfter55')
                : t('showCalculationsAfter55')}
            </button>
          </div>
        )}
        {historyAfterWithdrawalAgeOpen && (
          <>
            <HistoryTable
              data={historyAfterWithdrawalAge}
              groupByYear={monthlySalary > 0}
              salaryData={salaryHistoryAfterWithdrawalAge}
            />
            <div className="text-center my-6">
              <button
                className="bg-cyan-800 hover:bg-cyan-600 text-white py-2 px-4 rounded"
                onClick={() =>
                  setHistoryAfterWithdrawalAgeOpen(
                    !historyAfterWithdrawalAgeOpen
                  )
                }
              >
                {historyAfterWithdrawalAgeOpen ? 'Hide' : 'Show'} Calculations
                After 55!
              </button>
            </div>
          </>
        )}
      </Section>
    </>
  )
}

export default Results
