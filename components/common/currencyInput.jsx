import React from 'react'
import {
  FormControl,
  Input,
  InputAdornment,
  InputLabel,
} from '@material-ui/core/'

const CurrencyInput = (props) => {
  const { label, value, field, handleChange } = props

  return (
    <FormControl fullWidth>
      <InputLabel htmlFor="standard-adornment-amount">{label}</InputLabel>
      <Input
        id="standard-adornment-amount"
        value={value}
        onChange={handleChange(field)}
        type="number"
        startAdornment={<InputAdornment position="start">$</InputAdornment>}
      />
    </FormControl>
  )
}

export default CurrencyInput
