import React from 'react'
import { makeStyles } from '@material-ui/core/styles'

import { ExternalLink, InfoPopup, Paragraph } from '../../../common'

import { FutureValues } from '../../../../utils/cpf/types'
import { getYearsAndMonths, formatCurrency } from '../../../../utils/utils'
import { withdrawalAge } from '../../../../constants'

interface WithdrawalAgeInfoProps {
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

const WithdrawalAgeInfo: React.FunctionComponent<WithdrawalAgeInfoProps> = (
  props
) => {
  const { futureValues } = props
  const { comparisonValues } = futureValues
  const classes = useStyles()

  const comparisonSum = comparisonValues
    ? comparisonValues.ordinaryAccountAtWithdrawalAge +
      comparisonValues.specialAccountAtWithdrawalAge -
      (futureValues.ordinaryAccountAtWithdrawalAge +
        futureValues.specialAccountAtWithdrawalAge)
    : 0

  return (
    <>
      <Paragraph className={classes.paragraph}>
        In {getYearsAndMonths(futureValues.monthsTillWithdrawal)}, when you are{' '}
        <span className={classes.highlightText}>{withdrawalAge} years old</span>
        , you will have{' '}
        <span className={classes.highlightText}>
          {formatCurrency(futureValues.ordinaryAccountAtWithdrawalAge)}
        </span>{' '}
        in your Ordinary Account , and{' '}
        <span className={classes.highlightText}>
          {formatCurrency(futureValues.specialAccountAtWithdrawalAge)}
        </span>{' '}
        in your Special Account.
        <InfoPopup title="How calculations are made">
          <Paragraph className={classes.paragraph}>
            With regards to{' '}
            <ExternalLink
              url="https://www.cpf.gov.sg/members/FAQ/schemes/other-matters/others/FAQDetails?category=other+matters&group=Others&ajfaqid=2192131&folderid=13726"
              label="interest"
            />
            , CPF interest is computed monthly. It is then credited to your
            respective accounts and compounded annually.
          </Paragraph>
          <Paragraph className={classes.paragraph}>
            Central Provident Fund (CPF) members currently earn interest rates
            of up to 3.5% per annum on their Ordinary Account (OA) monies, and
            up to 5% per annum on their Special and MediSave Account (SMA)
            monies. Retirement Account (RA) monies currently earn up to 5% per
            annum. The above{' '}
            <ExternalLink
              url="https://www.cpf.gov.sg/Members/AboutUs/about-us-info/cpf-interest-rates"
              label="interest rates"
            />{' '}
            include an extra 1% interest paid on the first $60,000 of a member's
            combined balances (with up to $20,000 from the OA).
          </Paragraph>
          <img
            src="/TableC1_AllocationRates.png"
            alt="CPF Allocation Table"
            className={classes.image}
          />
          <Paragraph className={classes.paragraph}>
            The image above for CPF Allocation rates was sourced from{' '}
            <ExternalLink
              url="https://www.cpf.gov.sg/Employers/EmployerGuides/employer-guides/paying-cpf-contributions/cpf-contribution-and-allocation-rates"
              label="here"
            />
            .
          </Paragraph>
        </InfoPopup>
      </Paragraph>
      {comparisonValues && (
        <Paragraph className={classes.addendum}>
          * Without housing loans, or transfering from OA to SA, you would have{' '}
          <span className={classes.highlightText}>
            {formatCurrency(comparisonValues.ordinaryAccountAtWithdrawalAge)}
          </span>{' '}
          in your Ordinary Account , and{' '}
          <span className={classes.highlightText}>
            {formatCurrency(comparisonValues.specialAccountAtWithdrawalAge)}
          </span>{' '}
          in your Special Account. The sum of these three accounts is{' '}
          <span className={classes.highlightText}>
            {formatCurrency(Math.abs(comparisonSum))}
          </span>{' '}
          {comparisonSum >= 0 ? 'more' : 'less'} than the sum of the three
          acounts in your chosen scenario.
        </Paragraph>
      )}
    </>
  )
}

export default WithdrawalAgeInfo
