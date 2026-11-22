import React, { useState } from 'react'
import { useTranslations } from 'next-intl'

import { Section } from '../../common'
import { primaryPill } from '../../common/classes'
import HistoryTable from './results/HistoryTable'
import WithdrawalAgeInfo from './results/WithdrawalAgeInfo'
import PayoutAgeInfo from './results/PayoutAgeInfo'

import { FutureValues } from '@/utils/cpf/types'

interface ResultsProps {
  futureValues: FutureValues
}

function HistoryToggle({
  open,
  showLabel,
  hideLabel,
  onToggle,
}: {
  open: boolean
  showLabel: string
  hideLabel: string
  onToggle: () => void
}) {
  return (
    <div className="my-6 text-center">
      <button type="button" className={primaryPill} onClick={onToggle}>
        {open ? hideLabel : showLabel}
      </button>
    </div>
  )
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
          <HistoryToggle
            open={historyOpen}
            showLabel={t('showCalculationsTill55')}
            hideLabel={t('hideCalculationsTill55')}
            onToggle={() => setHistoryOpen(!historyOpen)}
          />
        )}
        {historyOpen && (
          <>
            <HistoryTable
              data={history}
              groupByYear={monthlySalary > 0}
              salaryData={salaryHistory}
            />
            <HistoryToggle
              open={historyOpen}
              showLabel={t('showCalculationsTill55')}
              hideLabel={t('hideCalculationsTill55')}
              onToggle={() => setHistoryOpen(!historyOpen)}
            />
          </>
        )}
      </Section>

      {/* OA and SA during Retirement Age (65)*/}
      <Section>
        <PayoutAgeInfo futureValues={futureValues} />

        {/* History Table for Transactions from 55 to 65 years old */}
        {historyAfterWithdrawalAge.length > 0 && (
          <HistoryToggle
            open={historyAfterWithdrawalAgeOpen}
            showLabel={t('showCalculationsAfter55')}
            hideLabel={t('hideCalculationsAfter55')}
            onToggle={() =>
              setHistoryAfterWithdrawalAgeOpen(!historyAfterWithdrawalAgeOpen)
            }
          />
        )}
        {historyAfterWithdrawalAgeOpen && (
          <>
            <HistoryTable
              data={historyAfterWithdrawalAge}
              groupByYear={monthlySalary > 0}
              salaryData={salaryHistoryAfterWithdrawalAge}
            />
            <HistoryToggle
              open={historyAfterWithdrawalAgeOpen}
              showLabel={t('showCalculationsAfter55')}
              hideLabel={t('hideCalculationsAfter55')}
              onToggle={() =>
                setHistoryAfterWithdrawalAgeOpen(!historyAfterWithdrawalAgeOpen)
              }
            />
          </>
        )}
      </Section>
    </>
  )
}

export default Results
