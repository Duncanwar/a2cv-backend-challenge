import { Request, Response, NextFunction } from "express";

import ResponseService from "../services/response";

interface AuthenticatedRequest extends Request {
  user?: { role?: string, id: string };
}

export default function isUser(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  if (!req.user) {
    return ResponseService.send(res, 401, false, "Unauthorized");
  }
  if (req.user.role !== "User") {
    return ResponseService.send(res, 403, false, "Forbidden: Users only");
  }
  next();
}

