import { Request, Response, NextFunction } from "express";
import { requireRole } from "./requireRole";

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    role?: string;
  };
}

export default function isUser(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void | Response {
  return requireRole("User")(req, res, next);
}

