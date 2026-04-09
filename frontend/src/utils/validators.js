export function validateEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || '').trim().toLowerCase());
}

export function hasMinLength(value, minimum) {
  return String(value || '').trim().length >= minimum;
}
