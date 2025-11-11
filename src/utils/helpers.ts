import { Request, Response } from "express";
import ResponseService from "../services/response";

export const requireAuth = (req: Request): { id: string } | null => {
  if (!req.user || !req.user.id) {
    return null;
  }
  return { id: req.user.id };
};

export const sendUnauthorized = (res: Response): Response => {
  return ResponseService.send(
    res,
    401,
    false,
    "Unauthorized: User information is missing",
    null
  );
};

export const sendNotFound = (res: Response, resource: string = "Resource"): Response => {
  return ResponseService.send(
    res,
    404,
    false,
    `${resource} not found`,
    null
  );
};

export const parsePaginationParams = (query: any) => {
  const page = parseInt(query.page as string) || 1;
  const limit = parseInt(query.limit as string) || parseInt(query.pageSize as string) || 10;
  const pageNumber = Math.max(1, page);
  const pageSize = Math.max(1, limit);
  const skip = (pageNumber - 1) * pageSize;

  return { pageNumber, pageSize, skip };
};

