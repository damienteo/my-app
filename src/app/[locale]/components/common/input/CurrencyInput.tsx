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
        htmlFor="currency-input"
        className="block text-sm font-medium text-gray-700"
      >
        {label}
      </label>
      <div className="relative mt-1 rounded-md shadow-sm">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <span className="text-gray-500 sm:text-sm">$</span>
        </div>
        <input
          type="number"
          name="currency"
          id="currency-input"
          className={`block w-full pl-7 pr-12 sm:text-sm rounded-md ${
            error
              ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
              : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'
          }`}
          value={value}
          onChange={handleChange(field)}
          aria-invalid={error ? 'true' : 'false'}
        />
      </div>
      {helperText && (
        <p
          className={`mt-2 text-sm ${error ? 'text-red-600' : 'text-gray-500'}`}
        >
          {helperText}
        </p>
      )}
    </div>
  )
}

export default CurrencyInput
