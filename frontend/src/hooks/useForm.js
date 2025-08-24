import { useState, useCallback } from 'react'

const useForm = (initialValues = {}, validate = () => ({})) => {
  const [values, setValues] = useState(initialValues)
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = useCallback(
    (e) => {
      const { name, value, type, checked } = e.target
      setValues((prev) => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }))

      // Clear error when user starts typing
      if (errors[name]) {
        setErrors((prev) => ({
          ...prev,
          [name]: ''
        }))
      }
    },
    [errors]
  )

  const handleBlur = useCallback(
    (e) => {
      const { name } = e.target
      setTouched((prev) => ({
        ...prev,
        [name]: true
      }))

      // Validate field on blur
      const validationErrors = validate(values)
      if (validationErrors[name]) {
        setErrors((prev) => ({
          ...prev,
          [name]: validationErrors[name]
        }))
      }
    },
    [values, validate]
  )

  const handleSubmit = useCallback(
    async (onSubmit) => {
      return async (e) => {
        e.preventDefault()
        setIsSubmitting(true)

        // Validate all fields
        const validationErrors = validate(values)
        setErrors(validationErrors)

        // Mark all fields as touched
        const touchedFields = Object.keys(values).reduce(
          (acc, key) => ({ ...acc, [key]: true }),
          {}
        )
        setTouched(touchedFields)

        // If no errors, submit
        if (Object.keys(validationErrors).length === 0) {
          try {
            await onSubmit(values)
          } catch (error) {
            console.error('Form submission error:', error)
            setErrors((prev) => ({
              ...prev,
              submit: error.message
            }))
          }
        }

        setIsSubmitting(false)
      }
    },
    [values, validate]
  )

  const reset = useCallback(() => {
    setValues(initialValues)
    setErrors({})
    setTouched({})
    setIsSubmitting(false)
  }, [initialValues])

  const setFieldValue = useCallback((field, value) => {
    setValues((prev) => ({
      ...prev,
      [field]: value
    }))
  }, [])

  const setFieldError = useCallback((field, error) => {
    setErrors((prev) => ({
      ...prev,
      [field]: error
    }))
  }, [])

  return {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    reset,
    setFieldValue,
    setFieldError
  }
}

export default useForm