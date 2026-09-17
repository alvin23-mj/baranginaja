const INDONESIAN_PHONE_REGEX = /^(?:\+62|62|0)8[1-9][0-9]{6,11}$/;
const DIGITS_ONLY_REGEX = /^[0-9]+$/;

export function isValidIndonesianPhone(value: string): boolean {
  return INDONESIAN_PHONE_REGEX.test(value.trim());
}

export function isDigitsOnly(value: string): boolean {
  return DIGITS_ONLY_REGEX.test(value.trim());
}
