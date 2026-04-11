const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const isNotEmpty = (value: string): boolean => {
  return value.trim() !== "";
};

export const isValidEmail = (value: string): boolean => {
  return EMAIL_REGEX.test(value.trim());
};

export const hasMinLength = (value: string, min: number): boolean => {
  return value.length >= min;
};
