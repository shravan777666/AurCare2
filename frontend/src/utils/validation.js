export const validateEmail = (email) => {
  const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i
  if (!email) return 'Email is required'
  if (!emailRegex.test(email)) return 'Invalid email address'
  return ''
}

export const validatePassword = (password) => {
  if (!password) return 'Password is required'
  if (password.length < 8) return 'Password must be at least 8 characters'
  if (!/[A-Z]/.test(password)) return 'Password must contain at least one uppercase letter'
  if (!/[a-z]/.test(password)) return 'Password must contain at least one lowercase letter'
  if (!/[0-9]/.test(password)) return 'Password must contain at least one number'
  if (!/[!@#$%^&*]/.test(password)) return 'Password must contain at least one special character (!@#$%^&*)'
  return ''
}

export const validateContactNumber = (number) => {
  const phoneRegex = /^\d{10}$/
  if (!number) return 'Contact number is required'
  if (!phoneRegex.test(number)) return 'Contact number must be 10 digits'
  return ''
}

export const validateName = (name) => {
  if (!name) return 'Name is required'
  if (name.length < 2) return 'Name must be at least 2 characters'
  if (name.length > 50) return 'Name must be less than 50 characters'
  return ''
}

export const validateSpecialization = (specialization) => {
  if (!specialization) return 'Specialization is required'
  if (specialization.length < 2) return 'Specialization must be at least 2 characters'
  if (specialization.length > 100) return 'Specialization must be less than 100 characters'
  return ''
}

export const validateExperience = (experience) => {
  if (!experience) return 'Years of experience is required'
  if (isNaN(experience)) return 'Experience must be a number'
  if (Number(experience) < 0) return 'Experience cannot be negative'
  if (Number(experience) > 50) return 'Experience seems too high'
  return ''
}

export const validateAvailability = (availability) => {
  if (!availability) return 'Availability schedule is required'
  
  const hasAtLeastOneDay = Object.values(availability).some(
    (day) => day.isAvailable
  )
  
  if (!hasAtLeastOneDay) return 'Please select at least one day of availability'
  
  for (const [day, schedule] of Object.entries(availability)) {
    if (schedule.isAvailable) {
      if (!schedule.start || !schedule.end) {
        return `Please set both start and end time for ${day}`
      }
      
      const start = new Date(`2000/01/01 ${schedule.start}`)
      const end = new Date(`2000/01/01 ${schedule.end}`)
      
      if (end <= start) {
        return `End time must be after start time for ${day}`
      }
    }
  }
  
  return ''
}

export const validateProfileImage = (file) => {
  if (!file) return ''
  
  const maxSize = 5 * 1024 * 1024 // 5MB
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif']
  
  if (!allowedTypes.includes(file.type)) {
    return 'Profile image must be JPEG, PNG, or GIF'
  }
  
  if (file.size > maxSize) {
    return 'Profile image must be less than 5MB'
  }
  
  return ''
}

export const validateCertifications = (files) => {
  if (!files || files.length === 0) return ''
  
  const maxSize = 10 * 1024 * 1024 // 10MB per file
  const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png']
  
  for (const file of files) {
    if (!allowedTypes.includes(file.type)) {
      return 'Certifications must be PDF, JPEG, or PNG'
    }
    
    if (file.size > maxSize) {
      return 'Each certification file must be less than 10MB'
    }
  }
  
  return ''
}