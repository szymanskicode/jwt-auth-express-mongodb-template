import dotenv from "dotenv";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import { IUser } from "../types";

// const Post = require('./post');

dotenv.config();

const userSchema = new mongoose.Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    tokens: [
      {
        token: {
          type: String,
          required: true,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

userSchema.virtual("posts", {
  ref: "Post",
  localField: "_id",
  foreignField: "owner",
});

// Methodes are accessable on Instances of model - methods need to use regular function, not arrow function.
userSchema.methods.generateAuthToken = async function () {
  const user = this;
  const token = jwt.sign({ _id: user.id.toString() }, process.env.JWT_SECRET!);

  user.tokens = user.tokens.concat({ token });

  await user.save();

  return token;
};

userSchema.methods.toJSON = function () {
  const user = this;
  const userObject = user.toObject();

  delete userObject.password;
  delete userObject.tokens;

  return userObject;
};

// On models using .statics we can provide our own custom methodes.
// Static methodes are accessable on Models
userSchema.statics.findByCredentials = async (email: string, password: string) => {
  try {
    const user = await User.findOne({ email });

    if (!user) {
      return null;
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return null;
    }

    return user;
  } catch {
    throw new Error("Unable to login");
  }
};

// Thanks to Schema we can provide a middleware which can run before or after specific method will take place.
// Hash the plain text password before saving
userSchema.pre("save", async function (next) {
  const user = this;

  if (user.isModified("password")) {
    user.password = await bcrypt.hash(user.password, 8);
  }

  next();
});

// Delete user posts when user is removed
// userSchema.pre("remove", async function (next) {
//   const user = this;
//   // await Post.deleteMany({ owner: user._id });
//   next();
// });

const User = mongoose.model<IUser>("User", userSchema);

export default User;
