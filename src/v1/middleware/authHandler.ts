import { NextFunction, Request, Response } from "express";
import JWTService from "../services/jwt";
import { UnauthorizedException } from "../utils/exception";

interface AuthenticatedRequest extends Request {
  user?: any;
}

export const authenticate = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const token = req.headers["authorization"]?.split(" ")[1];
  if (!token) {
    throw new UnauthorizedException();
  }
  try {
    const isValid = JWTService.verifyToken(token);

    if (!isValid) {
      console.log("here");

      throw new UnauthorizedException();
    } else {
      console.log(isValid);
      req.user = isValid;
      next();
    }
  } catch (err) {
    next(err);
  }
};
