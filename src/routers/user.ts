import express, { Request, Response } from "express";

import auth from "../middleware/auth";
import User from "../models/user";
import { ValidationErrors } from "../types";

import { checkErrors } from "../utils/validators/checkErrors";
import { validateEmailUnique } from "../utils/validators/validateEmailUnique";
import { validatePassword } from "../utils/validators/validatePassword";
import { validateRepeatPassword } from "../utils/validators/validateRepeatPassword";

const router = express.Router();

//////////////////////
///// READ USERS /////
//////////////////////
router.get("/api/users", async (req: Request, res: Response) => {
  try {
    const users = await User.find();

    return res.status(200).send({ users });
  } catch (error) {
    console.log(error);
    return res.status(500).send({ error });
  }
});

////////////////////////
///// READ USER ME /////
////////////////////////
router.get("/api/users/me", auth, async (req: Request, res: Response) => {
  try {
    const user = req.user;

    return res.status(200).send({ user });
  } catch (error) {
    console.log(error);
    return res.status(500).send({ error });
  }
});

///////////////////////////
///// READ USER BY ID /////
///////////////////////////
router.get("/api/users/:id", async (req: Request, res: Response) => {
  try {
    const _id = req.params.id;

    const user = await User.findById(_id);

    return res.status(200).send({ user });
  } catch (error) {
    console.log(error);
    return res.status(500).send({ error });
  }
});

////////////////////////
///// EDIT USER ME /////
////////////////////////
router.patch("/api/users/me", auth, async (req: Request, res: Response) => {
  try {
    const { email, password, repeatPassword } = req.body;

    // Checking allowed updates
    const requestedUpdates = Object.keys(req.body);
    const allowedUpdates = ["email", "password"];
    const isValidUpdate = requestedUpdates.every((update) => allowedUpdates.includes(update));

    if (!isValidUpdate) {
      return res.status(403).send({ error: { message: "Invalid update!" } });
    }

    // Checking for errors
    const validationErrors: ValidationErrors = {};

    if (email) {
      validationErrors.email = await validateEmailUnique(email);
    }

    if (password) {
      validationErrors.password = validatePassword(password);
      validationErrors.repeatPassword = validateRepeatPassword(password, repeatPassword);
    }

    // Ending validation
    if (checkErrors(validationErrors)) {
      return res.status(400).send({ error: { message: "Bad request!", validationErrors } });
    }

    const user = req.user;

    requestedUpdates.forEach((update) => (user[update] = req.body[update]));

    await user.save();

    return res.status(200).send({ user });
  } catch (error) {
    console.log(error);
    return res.status(500).send({ error });
  }

  /*
  NOTE:
  In this case we can't use .findByIdAndUpdate() method, because this method is
  executed directly on database and omit using .save() method where in our case
  is declared pre-save hash password function, which wouldn't be executed.
  Example: 
    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
    });
  Option "new" allowes to return user object already updated instead of user which
  was has been found in database before saving the updates.
  */
});

//////////////////////////
///// DELETE USER ME /////
//////////////////////////
router.delete("/api/users/me", auth, async (req: Request, res: Response) => {
  try {
    const user = req.user;

    await User.findByIdAndDelete(user._id);

    return res.status(200).send({ user });
  } catch (error) {
    console.log(error);
    return res.status(500).send({ error });
  }
});

export default router;
