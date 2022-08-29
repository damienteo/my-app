import React from 'react'
import {
  FormControl,
  FormHelperText,
  Input,
  InputAdornment,
  InputLabel,
} from '@mui/material/'

type CurrencyInputProps = {
  label: string
  value: string
  field: string
  error: boolean
  helperText?: string
  handleChange: (
    field: string
  ) => (event: React.ChangeEvent<HTMLInputElement>) => void
}

const CurrencyInput: React.FunctionComponent<CurrencyInputProps> = (props) => {
  const { label, value, field, handleChange, error, helperText } = props

  return (
    <FormControl fullWidth>
      <InputLabel htmlFor="standard-adornment-amount">{label}</InputLabel>
      <Input
        id="standard-adornment-amount"
        value={value}
        onChange={handleChange(field)}
        type="number"
        error={error}
        startAdornment={<InputAdornment position="start">$</InputAdornment>}
      />
      <FormHelperText id="component-error-text">{helperText}</FormHelperText>
    </FormControl>
  )
}

export default CurrencyInput
