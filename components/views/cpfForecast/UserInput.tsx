import React, { useState } from 'react'
import moment from 'moment'
import { makeStyles } from '@material-ui/core/styles'
import {
  Button,
  Grid,
  Snackbar,
  TextField,
  IconButton,
  InputAdornment,
} from '@material-ui/core/'
import CloseIcon from '@material-ui/icons/Close'
import { cyan, teal } from '@material-ui/core/colors/'

import { KeyboardDatePicker } from '@material-ui/pickers'
import {
  CurrencyInput,
  ExternalLink,
  InfoPopup,
  Paragraph,
  Section,
} from '../../common'

import {
  calculateFutureValues,
  roundTo2Dec,
} from '../../../utils/cpf/cpfForecast'
import {
  ErrorValues,
  Values,
  AccountValues,
  FutureValues,
} from '../../../utils/cpf/types'
import { cpfAccounts, withdrawalAge } from '../../../constants'

interface UserInputProps {
  setCalculating: (isCalculating: boolean) => void
  setFutureValues: (values: FutureValues) => void
}

const useStyles = makeStyles((theme) => ({
  paragraph: {
    margin: theme.spacing(0, 0, 1.5),
    color: '#282c35',
  },
  inputWrapper: {
    padding: 10,
    '& .MuiFormControl-root': {
      width: '100%',
    },
  },
  buttonWrapper: {
    textAlign: 'center',
    margin: theme.spacing(1.5, 0),
  },
  button: {
    backgroundColor: teal[200],
    '&:hover': {
      backgroundColor: cyan[200],
    },
  },
  longLabel: {
    [theme.breakpoints.down('xs')]: {
      '& .MuiInputBase-input': { padding: '20px 0 7px' },
      '& .MuiInputAdornment-root ': { marginTop: 15 },
    },
  },
}))

const minDate = moment().subtract(withdrawalAge, 'y')
const maxDate = moment().subtract(16, 'y')

const UserInput: React.FunctionComponent<UserInputProps> = (props) => {
  const classes = useStyles()
  const { setFutureValues, setCalculating } = props

  const [values, setValues] = useState<Values>({
    ordinaryAccount: '0',
    specialAccount: '0',
    monthlySalary: '0',
    salaryIncreaseRate: '0',
    housingLoan: '0',
  })
  const [selectedDate, handleDateChange] = useState<moment.Moment>(maxDate)
  const [housingLoanDate, handleHousingDateChange] = useState<moment.Moment>(
    moment()
  )

  const [errors, setErrors] = useState<ErrorValues>({})

  const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false)

  const validateValues = () => {
    const nextErrors = {} as ErrorValues

    Object.keys(values).map((field: string) => {
      if (parseFloat(values[field]) < 0) {
        nextErrors[field] = 'Please enter a value which is 0 or larger'
      } else {
        nextErrors[field] = undefined
      }
    })

    setErrors({ ...nextErrors })

    return nextErrors
  }

  const handleChange = (field: string) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const nextValue = roundTo2Dec(event.target.value)
    setValues({ ...values, [field]: nextValue })

    const nextErrors = { ...errors }
    nextErrors[field] = undefined
    setErrors({ ...nextErrors })
  }

  const handleSubmit = () => {
    const nextErrors = validateValues()

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
      housingLoanDate,
    } as AccountValues

    if (isCorrectInput) {
      const nextFutureValues = calculateFutureValues(accountValues)
      setFutureValues(nextFutureValues)
      setCalculating(true)
      setSnackbarOpen(true)
    }
  }

  const handleSnackbarClose = () => {
    setSnackbarOpen(false)
  }

  return (
    <>
      <Section>
        <Paragraph className={classes.paragraph}>
          First, type in the current amounts in your CPF Ordinary and Special
          Accounts.{' '}
          <InfoPopup title="Info on CPF OA and SA">
            <Paragraph className={classes.paragraph}>
              Information on what CPF is about can be found here:{' '}
              <ExternalLink
                url="https://www.cpf.gov.sg/Members/AboutUs/about-us-info/cpf-overview"
                label="CPF"
              />
              .
            </Paragraph>
          </InfoPopup>
        </Paragraph>
        <Grid container>
          {cpfAccounts.map((account) => (
            <Grid
              item
              xs={12}
              md={6}
              className={classes.inputWrapper}
              key={account.field}
            >
              <CurrencyInput
                value={values[account.field]}
                label={account.label}
                field={account.field}
                error={Boolean(errors[account.field])}
                helperText={errors[account.field]}
                handleChange={handleChange}
              />
            </Grid>
          ))}
        </Grid>
      </Section>
      <Section>
        <Paragraph className={classes.paragraph}>
          Next, type in your date of birth. We will use this to calculate the
          date when you can start withdrawals.{' '}
          <InfoPopup title="Withdrawal of CPF Savings">
            <Paragraph className={classes.paragraph}>
              Members can withdraw their CPF retirement savings any time from{' '}
              {withdrawalAge} years old. The withdrawal of your CPF retirement
              savings is optional. More info can be found can be found{' '}
              <ExternalLink
                url="https://www.cpf.gov.sg/Members/FAQ/schemes/retirement/withdrawals-of-cpf-savings-from-55"
                label="here"
              />
              .
            </Paragraph>
          </InfoPopup>
        </Paragraph>
        <Grid container>
          <Grid item xs={12} md={6} className={classes.inputWrapper}>
            <KeyboardDatePicker
              value={selectedDate}
              label="Date of Birth"
              // TODO: Fix Type '(date: moment.Moment) => void' is not assignable to type '(date: MaterialUiPickersDate, value?: string | null | undefined) => void'.
              onChange={(date: any) => handleDateChange(date)}
              format="dd/MM/yyyy"
              minDate={minDate}
              maxDate={maxDate}
              minDateMessage={`This date means that you are already ${withdrawalAge} years old`}
              maxDateMessage="You need to be 16 years old and above to contribute to CPF"
            />
          </Grid>
        </Grid>
      </Section>
      <Section>
        <Paragraph className={classes.paragraph}>
          Finally, you may add in your monthly salary (before taxes and CPF
          contribution), as well as expectations on how much it may increase per
          year. *Increase in monthly salary is calculated at the beginning of
          each year.{' '}
          <InfoPopup title="Info on Employer / Employee CPF Contribution">
            <Paragraph className={classes.paragraph}>
              When{' '}
              <ExternalLink
                url="https://www.cpf.gov.sg/Employers/EmployerGuides/employer-guides/paying-cpf-contributions/cpf-contribution-and-allocation-rates"
                label="55 and below"
              />
              , the employer contributes 17% of the monthly salary, while the
              employee contributes 20%.
            </Paragraph>
            <Paragraph className={classes.paragraph}>
              Do also take note that the{' '}
              <ExternalLink
                url="https://www.cpf.gov.sg/employers/FAQ/employer-guides/hiring-employees/cpf-contributions-for-your-employees/FAQDetails?category=Hiring+Employees&group=CPF+Contributions+for+your+Employees&ajfaqid=2195045&folderid=14019"
                label="Ordinary Wage (OW) Ceiling"
              />{' '}
              sets the maximum amount of OWs on which CPF contributions are
              payable per month. The prevailing OW Ceiling is $6,000 per month.
            </Paragraph>
          </InfoPopup>
        </Paragraph>
        <Grid container className={classes.longLabel}>
          <Grid item xs={12} md={6} className={classes.inputWrapper}>
            <CurrencyInput
              value={values.monthlySalary}
              label="Monthly Salary (Optional)"
              field="monthlySalary"
              error={Boolean(errors.monthlySalary)}
              helperText={errors.monthlySalary}
              handleChange={handleChange}
            />
          </Grid>
          <Grid item xs={12} md={6} className={classes.inputWrapper}>
            <TextField
              value={values.salaryIncreaseRate}
              label="Projected % Increase/Year (Optional)"
              error={Boolean(errors.salaryIncreaseRate)}
              helperText={errors.salaryIncreaseRate}
              onChange={handleChange('salaryIncreaseRate')}
              InputProps={{
                endAdornment: <InputAdornment position="end">%</InputAdornment>,
              }}
            />
          </Grid>
        </Grid>
      </Section>

      <Section>
        {/* TODO: Add details on options when CPF site is up */}
        <Paragraph className={classes.paragraph}>Additional Options:</Paragraph>
        <Grid container className={classes.longLabel}>
          <Grid item xs={12} md={6} className={classes.inputWrapper}>
            <CurrencyInput
              value={values.housingLoan}
              label="Use CPF for Housing Loan (Optional)"
              field="housingLoan"
              error={Boolean(errors.housingLoan)}
              helperText={errors.housingLoan}
              handleChange={handleChange}
            />
          </Grid>
          <Grid item xs={12} md={6} className={classes.inputWrapper}>
            <KeyboardDatePicker
              value={housingLoanDate}
              label="Planned Date for Housing Loan (Optional)"
              // TODO: Fix Type '(date: moment.Moment) => void' is not assignable to type '(date: MaterialUiPickersDate, value?: string | null | undefined) => void'.
              onChange={(date: any) => handleHousingDateChange(date)}
              format="dd/MM/yyyy"
              minDate={moment()}
              minDateMessage={`This date is before the present`}
              maxDateMessage="You need to be 16 years old and above to contribute to CPF"
            />
          </Grid>
        </Grid>
      </Section>

      <div className={classes.buttonWrapper}>
        <Button
          variant="contained"
          className={classes.button}
          onClick={handleSubmit}
        >
          Forecast my CPF!
        </Button>
      </div>

      <Snackbar
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        open={snackbarOpen}
        autoHideDuration={1000}
        onClose={handleSnackbarClose}
        message="Success!"
        action={
          <IconButton
            size="small"
            aria-label="close"
            color="inherit"
            onClick={handleSnackbarClose}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        }
      />
    </>
  )
}

export default UserInput
