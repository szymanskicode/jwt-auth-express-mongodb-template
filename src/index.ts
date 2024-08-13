import "./db/mongoose";
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";

import authRouter from "./routers/auth";
import userRouter from "./routers/user";
import postRouter from "./routers/post";

const app = express();
const port = process.env.PORT || 5000;

// Cors Middleware
app.use(cors());

// Express Middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  next();
});

// Automaticaly parse incoming request data
app.use(express.json());

app.use(authRouter);
app.use(userRouter);
app.use(postRouter);

app.listen(port, () => {
  console.log("Server is up on port " + port);
});
