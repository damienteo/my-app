import React, { useState } from 'react'
import { makeStyles } from '@mui/styles'
import { styled } from '@mui/material/styles'
import {
  AccordionDetails,
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  FormHelperText,
  Grid,
  Select,
  Snackbar,
  TextField,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
} from '@mui/material/'
import MuiAccordion, { AccordionProps } from '@mui/material/Accordion'
import MuiAccordionSummary, {
  AccordionSummaryProps,
} from '@mui/material/AccordionSummary'
import CloseIcon from '@mui/icons-material/Close'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import { blue, cyan, teal } from '@mui/material/colors/'
import dayjs, { Dayjs } from 'dayjs'

import { DatePicker } from '@mui/x-date-pickers/DatePicker'
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
import { cpfAccounts, momentMonths, withdrawalAge } from '../../../constants'
import * as gtag from '../../../lib/gtag'

const StyledAccordion = styled((props: AccordionProps) => (
  <MuiAccordion {...props} />
))(({ theme }) => ({
  backgroundColor: blue[50],
  color: '#282c35',
  borderRadius: 10,
  padding: 10,
}))

const StyledAccordionSummary = styled((props: AccordionSummaryProps) => (
  <MuiAccordionSummary {...props} />
))(({ theme }) => ({
  padding: 0,
  minHeight: 0,
  '& .MuiAccordionSummary-expandIconWrapper.Mui-expanded': {
    minHeight: 0,
  },
  '& .MuiAccordionSummary-content': {
    margin: 0,
  },
  '& .Mui-expanded': {
    minHeight: 0,
    margin: '0 0 -16px',
  },
  '& .MuiTypography-root': {
    margin: 0,
  },
}))

interface UserInputProps {
  setCalculating: (isCalculating: boolean) => void
  setFutureValues: (values: FutureValues) => void
}

const useStyles = makeStyles((theme) => ({
  paragraph: {
    margin: theme.spacing(0, 0, 1.5),
    color: '#282c35',
  },
  optionalSection: {
    backgroundColor: '#cbe8fd',
    padding: theme.spacing(0.25, 1),
    borderRadius: 5,
    marginTop: theme.spacing(2),
    [theme.breakpoints.down('xs')]: {
      '& .MuiInputBase-input': { padding: '20px 0 7px' },
      '& .MuiInputAdornment-root ': { marginTop: 15 },
    },
  },
  optionHeaderWrapper: {
    marginTop: theme.spacing(1.5),
  },
  optionHeader: {
    fontSize: '0.9rem',
    color: '#282c35',
  },
  inputWrapper: {
    padding: 10,
    '& .MuiFormControl-root': {
      width: '100%',
    },
  },
  checkboxWrapper: {
    padding: '0 10px 10px',
    '& .MuiFormControl-root': {
      width: '100%',
    },
    '& .MuiFormControlLabel-label': {
      fontSize: '0.75rem',
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
  checkboxError: {
    color: '#f44336',
    marginTop: 0,
  },
  accordianDetails: {
    display: 'block',
    padding: 0,
  },
}))

const minDate = dayjs().subtract(withdrawalAge, 'y')
const maxDate = dayjs().subtract(16, 'y')

const UserInput: React.FunctionComponent<UserInputProps> = (props) => {
  const classes = useStyles()
  const { setFutureValues, setCalculating } = props

  const [values, setValues] = useState<Values>({
    ordinaryAccount: '0',
    specialAccount: '0',
    monthlySalary: '0',
    monthsOfBonus: '0',
    bonusMonth: '0',
    salaryIncreaseRate: '0',
    housingLumpSum: '0',
    housingMonthlyPayment: '0',
    housingLoanTenure: '0',
  })
  const [selectedDate, handleDateChange] = useState<Dayjs | null>(maxDate)
  const [housingLumpSumDate, handleHousingLumpSumDateChange] = useState<Dayjs>(
    dayjs()
  )
  const [housingLoanDate, handleHousingLoanDateChange] = useState<Dayjs>(
    dayjs()
  )
  const [specialAccountOnly, setSpecialAccountOnly] = useState<boolean>(false)

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

    if (specialAccountOnly === true && parseFloat(values.housingLumpSum) > 0) {
      nextErrors.specialAccountOnly =
        "You won't have money in your Ordinary Account to use for housing if you shift all your money to your special account."
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

  // TODO: Fix typing
  const handleDropdownChange = (event: any) => {
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
      // setCalculating to false refreshes breakdown in case new information needs to be displayed
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
            <DatePicker
              value={selectedDate}
              label="Date of Birth"
              // TODO: Fix Type '(date: Dayjs) => void' is not assignable to type '(date: MaterialUiPickersDate, value?: string | null | undefined) => void'.
              onChange={(date: any) => handleDateChange(date)}
              // inputFormat="dd/MM/yyyy"
              minDate={minDate}
              maxDate={maxDate}
              // views={['day', 'month', 'year']}
              renderInput={(params) => <TextField {...params} />}
              // minDateMessage={`This date means that you are already ${withdrawalAge} years old`}
              // maxDateMessage="You need to be 16 years old and above to contribute to CPF"
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
              label="Projected Salary % Increase/Year (Optional)"
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

      <StyledAccordion TransitionProps={{ unmountOnExit: true }}>
        <StyledAccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="additional-options"
          id="additional-options"
        >
          <Paragraph className={classes.paragraph}>
            Optional (Bonuses, Housing, etc)
          </Paragraph>
        </StyledAccordionSummary>
        <AccordionDetails className={classes.accordianDetails}>
          {/* Option 1: Take Bonus in account */}
          <Grid container className={classes.optionalSection}>
            <Grid item xs={12} className={classes.optionHeaderWrapper}>
              <Paragraph className={classes.optionHeader}>
                1) CPF contribution from expected Bonus{' '}
                <InfoPopup title="Bonuses Subject to CPF Contribution">
                  <Paragraph className={classes.paragraph}>
                    There is an{' '}
                    <ExternalLink
                      url="https://www.cpf.gov.sg/employers/FAQ/employer-guides/Hiring-Employees/CPF-Contributions-for-your-Employees/FAQDetails?category=Hiring%20Employees&group=CPF%20Contributions%20for%20your%20Employees&folderid=14230&ajfaqid=2198478"
                      label="Additional Wage (AW) Ceiling"
                    />{' '}
                    that sets a maximum on the amount of bonus that are subject
                    to CPF contribution.
                  </Paragraph>
                </InfoPopup>
              </Paragraph>
            </Grid>
            <Grid item xs={12} md={6} className={classes.inputWrapper}>
              <TextField
                value={values.monthsOfBonus}
                label="Estimated Yearly Bonus in Months (Optional)"
                error={Boolean(errors.monthsOfBonus)}
                helperText={errors.monthsOfBonus}
                onChange={handleChange('monthsOfBonus')}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">months</InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={6} className={classes.inputWrapper}>
              <FormControl>
                <InputLabel id="demo-simple-select-helper-label">
                  Month in which Bonus is given (Optional)
                </InputLabel>
                <Select
                  labelId="demo-simple-select-helper-label"
                  id="demo-simple-select-helper"
                  value={values.bonusMonth}
                  onChange={handleDropdownChange}
                >
                  {momentMonths.map((month) => (
                    <MenuItem value={month.value}>{month.label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
          {/* Option 2: Use CPF as lump sum for Housing */}
          <Grid container className={classes.optionalSection}>
            <Grid item xs={12} className={classes.optionHeaderWrapper}>
              <Paragraph className={classes.optionHeader}>
                2) Use CPF to pay for Housing (Lump Sum){' '}
                <InfoPopup title="Using CPF to buy Housing">
                  <Paragraph className={classes.paragraph}>
                    You may use funds in your CPF Ordinary Account to buy
                    housing either under the{' '}
                    <ExternalLink
                      url="https://www.cpf.gov.sg/Members/Schemes/schemes/housing/public-housing-scheme"
                      label="Public Housing Scheme"
                    />
                    , or the{' '}
                    <ExternalLink
                      url="https://www.cpf.gov.sg/Members/Schemes/schemes/housing/private-properties-scheme"
                      label="Private Properties Scheme"
                    />{' '}
                    .
                  </Paragraph>
                </InfoPopup>
              </Paragraph>
            </Grid>
            <Grid item xs={12} md={6} className={classes.inputWrapper}>
              <CurrencyInput
                value={values.housingLumpSum}
                label="Lump Sum for Housing from CPF (Optional)"
                field="housingLumpSum"
                error={Boolean(errors.housingLumpSum)}
                helperText={errors.housingLumpSum}
                handleChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} md={6} className={classes.inputWrapper}>
              <DatePicker
                value={housingLumpSumDate}
                label="Date for Lump Sum Payment (Optional)"
                // TODO: Fix Type '(date: Dayjs) => void' is not assignable to type '(date: MaterialUiPickersDate, value?: string | null | undefined) => void'.
                onChange={(date: any) => handleHousingLumpSumDateChange(date)}
                // inputFormat="dd/MM/yyyy"
                disablePast
                renderInput={(params) => <TextField {...params} />}
                // minDateMessage={`This date is before the present`}
              />
            </Grid>
          </Grid>
          {/* Option 3: Use CPF as to pay for housing loan */}
          <Grid container className={classes.optionalSection}>
            <Grid item xs={12} className={classes.optionHeaderWrapper}>
              <Paragraph className={classes.optionHeader}>
                3) Use CPF to pay for Housing Loan{' '}
                <InfoPopup title="Using CPF to buy Housing">
                  <Paragraph className={classes.paragraph}>
                    You may use funds in your CPF Ordinary Account to buy
                    housing either under the{' '}
                    <ExternalLink
                      url="https://www.cpf.gov.sg/Members/Schemes/schemes/housing/public-housing-scheme"
                      label="Public Housing Scheme"
                    />
                    , or the{' '}
                    <ExternalLink
                      url="https://www.cpf.gov.sg/Members/Schemes/schemes/housing/private-properties-scheme"
                      label="Private Properties Scheme"
                    />{' '}
                    .
                  </Paragraph>
                </InfoPopup>
              </Paragraph>
            </Grid>
            <Grid item xs={12} md={6} className={classes.inputWrapper}>
              <CurrencyInput
                value={values.housingMonthlyPayment}
                label="Monthly Payment (Optional)"
                field="housingMonthlyPayment"
                error={Boolean(errors.housingMonthlyPayment)}
                helperText={errors.housingMonthlyPayment}
                handleChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} md={6} className={classes.inputWrapper}>
              <TextField
                value={values.housingLoanTenure}
                label="Loan Tenure - Years (Optional)"
                error={Boolean(errors.housingLoanTenure)}
                helperText={errors.housingLoanTenure}
                onChange={handleChange('housingLoanTenure')}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">years</InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={6} className={classes.inputWrapper}>
              <DatePicker
                value={housingLoanDate}
                label="Date of first Monthly Payment (Optional)"
                // TODO: Fix Type '(date: Dayjs) => void' is not assignable to type '(date: MaterialUiPickersDate, value?: string | null | undefined) => void'.
                onChange={(date: any) => handleHousingLoanDateChange(date)}
                // inputFormat="dd/MM/yyyy"
                disablePast
                renderInput={(params) => <TextField {...params} />}
                // minDateMessage={`This date is before the present`}
              />
            </Grid>
          </Grid>
          {/* Option 4: Move all Ordinary Account money to Special Account */}
          <Grid container className={classes.optionalSection}>
            <Grid item xs={12} className={classes.optionHeaderWrapper}>
              <Paragraph className={classes.optionHeader}>
                4) Move all Ordinary Account value and future contributions to
                Special Account (Optional){' '}
                <InfoPopup title="Higher Interest Rate in Special Account">
                  <Paragraph className={classes.paragraph}>
                    You may{' '}
                    <ExternalLink
                      url="https://www.cpf.gov.sg/members/FAQ/schemes/retirement/retirement-sum-topping-up-scheme/FAQDetails?category=Retirement&group=Retirement+Sum+Topping-Up+Scheme&ajfaqid=2188830&folderid=19860"
                      label="transfer"
                    />{' '}
                    funds from your Ordinary Account to your Special Account up
                    till the age of 55.
                  </Paragraph>
                </InfoPopup>
              </Paragraph>
            </Grid>
            <Grid item xs={12} className={classes.checkboxWrapper}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={specialAccountOnly}
                    onChange={handleSelect}
                    name="specialAccountOnly"
                    color="primary"
                  />
                }
                label="This is done to see the effect of the Special Account's higher interest rate (currently 4%), as compared to the Ordinary Account's Interest Rate (currently 2.5%)"
              />
              <FormHelperText className={classes.checkboxError}>
                {errors.specialAccountOnly}
              </FormHelperText>
            </Grid>
          </Grid>
        </AccordionDetails>
      </StyledAccordion>

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
