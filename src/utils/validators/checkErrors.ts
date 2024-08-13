import { ValidationErrors } from "../../types";

export const checkErrors = (validationErrors: ValidationErrors): boolean => {
  const errArr = Object.values(validationErrors);
  const errCount = errArr.length;
  const undefinedCount = errArr.filter((err) => err === undefined).length;

  if (errCount === undefinedCount) {
    return false;
  } else return true;
};
