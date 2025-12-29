import React from 'react'

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
    <div className="w-full">
      <label
        htmlFor={`currency-input-${field}`}
        className="block text-sm font-medium text-gray-300 mb-1"
      >
        {label}
      </label>
      <div className="relative mt-1 rounded-md">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <span className="text-gray-400 sm:text-sm">$</span>
        </div>
        <input
          type="number"
          name="currency"
          id={`currency-input-${field}`}
          className={`block w-full pl-7 pr-12 sm:text-sm rounded-md bg-gray-800 text-gray-200 border py-2 ${
            error
              ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
              : 'border-gray-600 focus:border-blue-500 focus:ring-blue-500'
          } focus:outline-none focus:ring-2`}
          value={value}
          onChange={handleChange(field)}
          aria-invalid={error ? 'true' : 'false'}
        />
      </div>
      {helperText && (
        <p
          className={`mt-2 text-sm ${error ? 'text-red-400' : 'text-gray-400'}`}
        >
          {helperText}
        </p>
      )}
    </div>
  )
}

export default CurrencyInput
