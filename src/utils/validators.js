export function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export function validateRequired(value, fieldName) {
  if (!value || !String(value).trim()) return `${fieldName} is required`
  return null
}

export function validatePositiveNumber(value, fieldName) {
  if (value == null || isNaN(value) || Number(value) < 0) return `${fieldName} must be a positive number`
  return null
}
