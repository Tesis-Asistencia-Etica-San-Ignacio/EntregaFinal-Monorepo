const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(value: string) {
  return EMAIL_PATTERN.test(value.trim());
}

export function validateEmail(value: string) {
  if (!isValidEmail(value)) return "El email no es válido";
  return undefined;
}
