import { Request, Response, NextFunction } from "express";

import { ERole } from "@prisma/client";
import { UnauthorizedException } from "../utils/exception";

interface AuthenticatedRequest extends Request {
  user?: { role: ERole };
}

const isAdmin = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) throw new Error();
  console.log(req.user);

  if (req.user.role !== ERole.ADMIN) {
    throw new UnauthorizedException("Access denied. Admins only.");
  }

  next();
};

export default isAdmin;
