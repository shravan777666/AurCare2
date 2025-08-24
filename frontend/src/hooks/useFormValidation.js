import { useState, useCallback } from 'react'
import {
  validateEmail,
  validatePassword,
  validateContactNumber,
  validateName,
  validateSpecialization,
  validateExperience,
  validateAvailability,
  validateProfileImage,
  validateCertifications
} from '../utils/validation'

export default function useFormValidation(initialValues = {}, validationRules = []) {
  const [values, setValues] = useState(initialValues)
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const validateField = useCallback((name, value) => {
    switch (name) {
      case 'email':
        return validateEmail(value)
      case 'password':
        return validatePassword(value)
      case 'contactNumber':
        return validateContactNumber(value)
      case 'name':
        return validateName(value)
      case 'specialization':
        return validateSpecialization(value)
      case 'experience':
        return validateExperience(value)
      case 'availability':
        return validateAvailability(value)
      case 'profileImage':
        return validateProfileImage(value)
      case 'certifications':
        return validateCertifications(value)
      default:
        return ''
    }
  }, [])

  const validateForm = useCallback(() => {
    const newErrors = {}
    let isValid = true

    validationRules.forEach((fieldName) => {
      const error = validateField(fieldName, values[fieldName])
      if (error) {
        newErrors[fieldName] = error
        isValid = false
      }
    })

    setErrors(newErrors)
    return isValid
  }, [validateField, values, validationRules])

  const handleChange = useCallback(
    (e) => {
      const { name, value, type, files } = e.target
      if (type === 'file') {
        setValues((prev) => ({
          ...prev,
          [name]: files[0]
        }))
      } else {
        setValues((prev) => ({
          ...prev,
          [name]: value
        }))
      }

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

      const error = validateField(name, values[name])
      if (error) {
        setErrors((prev) => ({
          ...prev,
          [name]: error
        }))
      }
    },
    [validateField, values]
  )

  const handleSubmit = useCallback(
    (onSubmit) => async (e) => {
      e.preventDefault()
      setIsSubmitting(true)

      // Validate all fields
      const isValid = validateForm()

      // Mark all fields as touched
      const touchedFields = validationRules.reduce(
        (acc, fieldName) => ({ ...acc, [fieldName]: true }),
        {}
      )
      setTouched(touchedFields)

      if (isValid) {
        try {
          await onSubmit(values)
        } catch (error) {
          setErrors((prev) => ({
            ...prev,
            submit: error.message
          }))
        }
      }

      setIsSubmitting(false)
    },
    [validateForm, values, validationRules]
  )

  const setFieldValue = useCallback((name, value) => {
    setValues((prev) => ({
      ...prev,
      [name]: value
    }))
  }, [])

  const reset = useCallback(() => {
    setValues(initialValues)
    setErrors({})
    setTouched({})
    setIsSubmitting(false)
  }, [initialValues])

  return {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    setFieldValue,
    reset,
    validateForm
  }
}