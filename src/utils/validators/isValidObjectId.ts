const mongoose = require("mongoose");

export const isValidObjectId = (value: string): boolean => {
  return mongoose.isValidObjectId(value);
};
