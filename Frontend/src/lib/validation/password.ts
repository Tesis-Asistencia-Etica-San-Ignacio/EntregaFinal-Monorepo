export function validateStrongPassword(value: string) {
  if (!/.{8,}/.test(value)) return "Debe tener al menos 8 caracteres";
  if (!/[A-Z]/.test(value)) return "Debe incluir al menos una letra mayúscula";
  if (!/[a-z]/.test(value)) return "Debe incluir al menos una letra minúscula";
  if (!/[0-9]/.test(value)) return "Debe incluir al menos un número";
  if (!/[^A-Za-z0-9]/.test(value)) return "Debe incluir al menos un carácter especial";
  return undefined;
}
