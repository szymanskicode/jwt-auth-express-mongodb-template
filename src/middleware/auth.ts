import { Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import User from "../models/user";
import { JWTPayload } from "../types";

dotenv.config();

const auth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).send({ error: { message: "Missing token!" } });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as unknown as JWTPayload;

    let user = await User.findOne({
      _id: decoded._id,
      "tokens.token": token,
    });

    if (!user) {
      return res.status(401).send({ error: { message: "Please authenticate!" } });
    }

    // Assign user and token to reqest object
    req.user = user;
    req.token = token;

    next();
  } catch (error) {
    console.log(error);
    return res.status(500).send({ error });
  }
};

export default auth;
