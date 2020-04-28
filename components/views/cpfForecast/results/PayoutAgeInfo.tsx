import React from 'react'
import { makeStyles } from '@material-ui/core/styles'

import { ExternalLink, InfoPopup, Paragraph } from '../../../common'

import { FutureValues } from '../../../../utils/cpf/types'
import { getYearsAndMonths, formatCurrency } from '../../../../utils/utils'
import { payoutAge } from '../../../../constants'

interface PayoutAgeInfoProps {
  futureValues: FutureValues
}

const useStyles = makeStyles((theme) => ({
  paragraph: {
    margin: theme.spacing(0, 0, 1.5),
    color: '#282c35',
  },
  addendum: {
    fontSize: '0.75rem',
    margin: theme.spacing(0, 0, 1.5),
    color: '#282c35',
  },
  image: {
    height: 'auto',
    width: '100%',
  },
  highlightText: {
    backgroundColor: '#282c35',
    color: '#e3f2fd',
    padding: '2px 5px',
  },
}))

const PayoutAgeInfo: React.FunctionComponent<PayoutAgeInfoProps> = (props) => {
  const { futureValues } = props
  const { comparisonValues } = futureValues
  const classes = useStyles()

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
      <Paragraph className={classes.paragraph}>
        In {getYearsAndMonths(futureValues.monthsTillWithdrawal + 120)}, when
        you are{' '}
        <span className={classes.highlightText}>{payoutAge} years old</span>,
        you will have{' '}
        <span className={classes.highlightText}>
          {formatCurrency(futureValues.ordinaryAccount)}
        </span>{' '}
        in your Ordinary Account ,{' '}
        <span className={classes.highlightText}>
          {formatCurrency(futureValues.specialAccount)}
        </span>{' '}
        in your Special Account, and{' '}
        <span className={classes.highlightText}>
          {formatCurrency(futureValues.retirementAccount)}
        </span>{' '}
        in your Retirement Account.
        <InfoPopup title="What is a Retirement Account?">
          <Paragraph className={classes.paragraph}>
            On your 55th birthday, CPF will create a{' '}
            <ExternalLink
              url="https://www.cpf.gov.sg/members/FAQ/schemes/retirement/retirement-sum-scheme/FAQDetails?category=retirement&group=Retirement+Sum+Scheme&ajfaqid=2190582&folderid=18088"
              label="Retirement Account"
            />{' '}
            (RA) for you. Savings from your Special Account and Ordinary
            Account, up to the Full Retirement Sum (FRS), will be{' '}
            <ExternalLink
              url="https://www.areyouready.sg/YourInfoHub/Pages/News-3-questions-about-CPF-withdrawals-from-age-55.aspx"
              label="transferred"
            />{' '}
            to your RA to form your retirement sum which will provide you with{' '}
            <ExternalLink
              url="https://www.cpf.gov.sg/Members/Schemes/schemes/retirement/cpf-life"
              label="monthly payouts"
            />{' '}
            from the age of 65.
          </Paragraph>
          <Paragraph className={classes.paragraph}>
            * We have also made an assumption for the Full Retirement Sum based
            on{' '}
            <ExternalLink
              url="https://www.cpf.gov.sg/members/FAQ/schemes/retirement/retirement-sum-scheme/FAQDetails?category=Retirement&group=Retirement+Sum+Scheme&ajfaqid=2190584&folderid=18088"
              label="historical trends"
            />
            . The FRS has increased by $5,000 per year from 2017 till 2021, and
            we have adjusted the FRS accordingly for when you turn 55. Please
            note that, this is purely an assumption made by me, who do not
            represent the government or CPF in any shape or form. It is just a
            forecast.
          </Paragraph>
        </InfoPopup>
      </Paragraph>
      {comparisonValues && (
        <Paragraph className={classes.addendum}>
          * Without housing loans, or transfering from OA to SA, you would have{' '}
          <span className={classes.highlightText}>
            {formatCurrency(comparisonValues.ordinaryAccount)}
          </span>{' '}
          in your Ordinary Account ,{' '}
          <span className={classes.highlightText}>
            {formatCurrency(comparisonValues.specialAccount)}
          </span>{' '}
          in your Special Account, and{' '}
          <span className={classes.highlightText}>
            {formatCurrency(comparisonValues.retirementAccount)}
          </span>{' '}
          in your Retirement Account. The sum of both these accounts is{' '}
          <span className={classes.highlightText}>
            {formatCurrency(Math.abs(comparisonSum))}
          </span>{' '}
          {comparisonSum >= 0 ? 'more' : 'less'} than the sum of both accounts
          in your chosen scenario.
        </Paragraph>
      )}
    </>
  )
}

export default PayoutAgeInfo
