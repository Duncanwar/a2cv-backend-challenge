import { Request, Response, NextFunction } from "express";

import { ERole } from "@prisma/client";
import { UnauthorizedException } from "../utils/exception";

interface AuthenticatedRequest extends Request {
  user?: { role: ERole };
}

const isSubManager = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) throw new Error();
  console.log(req.user);

  if (req.user.role !== ERole.SUB_MANAGER) {
    throw new UnauthorizedException("Access denied. SubManager only.");
  }

  next();
};

export default isSubManager;
