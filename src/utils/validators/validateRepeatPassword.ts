export const validateRepeatPassword = (password: string, repeatPassword: string): string | undefined => {
  if (password !== repeatPassword) {
    return "Passwords don't match.";
  } else {
    return undefined;
  }
};
