import User from "../../models/user";
import validator from "validator";

export const validateEmailUnique = async (email: string): Promise<string | undefined> => {
  if (!email) {
    return "E-mail is required.";
  }

  email = email.trim().toLowerCase();
  if (!email) {
    return "E-mail is required.";
  } else if (!validator.isEmail(email)) {
    return "E-mail is invalid.";
  } else if (email.length > 100) {
    return "E-mail max length is 100 characters.";
  } else if (await User.findOne({ email })) {
    return "E-mail is already registered.";
  } else return undefined;
};
