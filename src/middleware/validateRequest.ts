import { Request, Response, NextFunction } from "express";
import { validationResult } from "express-validator";
import ResponseService from "../services/response";

export const validateRequest = (
  req: Request,
  res: Response,
  next: NextFunction
): Response | void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return ResponseService.send(
      res,
      400,
      false,
      "Validation failed",
      null,
      errors.array().map((e) => e.msg)
    );
  }
  next();
};

