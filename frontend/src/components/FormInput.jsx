import { useState } from 'react'

export default function FormInput({
  label,
  name,
  type = 'text',
  value,
  onChange,
  required = false,
  pattern,
  minLength,
  maxLength,
  placeholder,
  error,
  className = '',
  ...props
}) {
  const [touched, setTouched] = useState(false)
  const [focused, setFocused] = useState(false)
  
  const showError = touched && error
  
  const baseClasses = 'w-full rounded-lg border px-3 py-2 text-sm transition-colors duration-200 ease-in-out'
  const focusClasses = 'focus:outline-none focus:ring-2 focus:ring-indigo-500'
  const errorClasses = showError ? 'border-red-500' : 'border-gray-300'
  const disabledClasses = props.disabled ? 'bg-gray-100 cursor-not-allowed' : ''
  
  return (
    <div className={`space-y-1 ${className}`}>
      {label && (
        <label htmlFor={name} className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        <input
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          onBlur={() => setTouched(true)}
          onFocus={() => setFocused(true)}
          required={required}
          pattern={pattern}
          minLength={minLength}
          maxLength={maxLength}
          placeholder={placeholder}
          className={`${baseClasses} ${focusClasses} ${errorClasses} ${disabledClasses}`}
          {...props}
        />
        
        {showError && (
          <div className="absolute -bottom-5 left-0 text-xs text-red-500">
            {error}
          </div>
        )}
      </div>
    </div>
  )
}