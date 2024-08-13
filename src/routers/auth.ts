import express, { Request, Response } from "express";

import auth from "../middleware/auth";
import User from "../models/user";

import { checkErrors } from "../utils/validators/checkErrors";
import { validateEmailUnique } from "../utils/validators/validateEmailUnique";
import { validateEmail } from "../utils/validators/validateEmail";
import { validatePassword } from "../utils/validators/validatePassword";
import { validateRepeatPassword } from "../utils/validators/validateRepeatPassword";
import { ValidationErrors } from "../types";

const router = express.Router();

/////////////////////////////
///// AUTHENTICATE USER /////
/////////////////////////////
router.post("/api/auth", auth, async (req: Request, res: Response) => {
  try {
    const user = req.user;

    return res.status(200).send({ user, isAuthenticated: true });
  } catch (error) {
    console.log(error);
    return res.status(500).send({ error });
  }
});

/////////////////////////
///// REGISTER USER /////
/////////////////////////
router.post("/api/auth/register", async (req: Request, res: Response) => {
  const { email, password, repeatPassword } = req.body;

  try {
    // Checking for errors
    const validationErrors: ValidationErrors = {};
    validationErrors.email = await validateEmailUnique(email);
    validationErrors.password = validatePassword(password);
    validationErrors.repeatPassword = validateRepeatPassword(password, repeatPassword);

    // Ending validation
    if (checkErrors(validationErrors)) {
      return res.status(400).send({ error: { message: "Bad request!", validationErrors } });
    }

    const user = new User({ email, password });

    await user.save();

    // @ts-ignore TODO!
    const token = await user.generateAuthToken();

    return res.status(201).send({ user, token });
  } catch (error) {
    console.log(error);
    return res.status(500).send({ error });
  }
});

//////////////////////
///// LOGIN USER /////
//////////////////////
router.post("/api/auth/login", async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    // Checking for errors
    const validationErrors: ValidationErrors = {};
    validationErrors.email = validateEmail(email);

    // Ending validation
    if (checkErrors(validationErrors)) {
      return res.status(400).send({ error: { message: "Bad request!", validationErrors } });
    }

    // Finding user by credentials
    // @ts-ignore TODO!
    const user = await User.findByCredentials(email, password);

    if (!user) {
      validationErrors.error = "Invalid credentials!";
      return res.status(404).send({ error: { message: "Invalid credentials!", validationErrors } });
    }

    // Generating token
    const token = await user.generateAuthToken();

    return res.status(200).send({ user, token });
  } catch (error) {
    console.log(error);
    return res.status(500).send({ error });
  }
});

///////////////////////
///// LOGOUT USER /////
///////////////////////
router.post("/api/auth/logout", auth, async (req: Request, res: Response) => {
  try {
    const user = req.user;

    user.tokens = user.tokens.filter((token: any) => {
      return token.token !== req.token;
    });

    await user.save();

    return res.status(200).send();
  } catch (error) {
    console.log(error);
    return res.status(500).send({ error });
  }
});

///////////////////////////
///// LOGOUT USER ALL /////
///////////////////////////
router.post("/api/auth/logoutAll", auth, async (req: Request, res: Response) => {
  try {
    const user = req.user;

    user.tokens = [];

    await user.save();

    res.status(200).send();
  } catch (error) {
    console.log(error);
    return res.status(500).send({ error });
  }
});

export default router;
