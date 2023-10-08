import { NextFunction, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { CustomRequest } from "../types/types.js";

export default function authMiddleware(
  req: CustomRequest,
  res: Response,
  next: NextFunction
) {
  try {
    if (!req.headers.authorization) {
      return res.status(401).send("Unauthorized");
    }

    if (!process.env.JWT_SECRET) {
      throw new Error("No JWT_SECRET specified in env, please add it!");
    }

    const { userId } = jwt.verify(
      req.headers.authorization,
      process.env.JWT_SECRET
    ) as JwtPayload;

    req.userId = userId;

    next();
  } catch (error) {
    console.error(error);
    return res.status(401).send("Unauthorized");
  }
}
