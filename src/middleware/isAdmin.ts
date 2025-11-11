import { Request, Response, NextFunction } from "express";
import { requireRole } from "./requireRole";

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    role?: string;
  };
}

export default function isAdmin(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void | Response {
  return requireRole("Admin")(req, res, next);
}
