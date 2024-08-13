export const validatePassword = (password: string): string | undefined => {
  if (!password) {
    return "Password is required.";
  }

  password = password.trim();
  if (!password) {
    return "Password is required.";
  } else if (password.length < 6) {
    return "Password min length is 6 characters.";
  } else if (password.length > 100) {
    return "Password max length is 100 characters.";
  } else {
    return undefined;
  }
};
