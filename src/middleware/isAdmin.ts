import { Request, Response, NextFunction } from "express";

import ResponseService from "../services/response";

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
) {
  if (!req.user) {
    return ResponseService.send(res, 401, false, "Unauthorized");
  }
  if (req.user.role !== "Admin") {
    return ResponseService.send(res, 403, false, "Forbidden: Admins only");
  }
  next();
}
