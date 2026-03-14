const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const isNotEmpty = (value: string): boolean => {
  return value.trim() !== "";
};

const isValidEmail = (value: string): boolean => {
  return EMAIL_REGEX.test(value.trim());
};

const hasMinLength = (value: string, min: number): boolean => {
  return value.length >= min;
};

export { isNotEmpty, isValidEmail, hasMinLength, EMAIL_REGEX };
