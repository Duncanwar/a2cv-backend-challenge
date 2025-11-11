import { Request, Response, NextFunction } from "express";
import ResponseService from "../services/response";

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    role?: string;
  };
}

export const requireRole = (allowedRole: string) => {
  return (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Response | void => {
    if (!req.user) {
      return ResponseService.send(res, 401, false, "Unauthorized");
    }
    if (req.user.role !== allowedRole) {
      return ResponseService.send(
        res,
        403,
        false,
        `Forbidden: ${allowedRole}s only`
      );
    }
    next();
  };
};

