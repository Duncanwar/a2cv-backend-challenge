import { Response as ExpressResponse, NextFunction, Request } from "express";
import { prisma } from "../../config/database";
import Response from "../../services/response";

interface AuthenticatedRequest extends Request {}

export default class ZoneController {
  static async getZone(
    req: AuthenticatedRequest,
    res: ExpressResponse,
    next: NextFunction
  ): Promise<ExpressResponse | void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const size = parseInt(req.query.size as string) || 10;

      const zone = await prisma.zone.findMany({
        skip: (page - 1) * size,
        take: size,
        include: {
          manager: {
            include: {
              user: true,
            },
          },
          buses: true,
          busStops: true,
        },
      });

      return Response.send(res, 200, "Zone retrieved successfully", {
        items: zone,
        itemCount: zone.length,
        itemsPerPage: size,
        currentPage: page,
      });
    } catch (error) {
      next(error);
    }
  }
  static async createZone(
    req: AuthenticatedRequest,
    res: ExpressResponse,
    next: NextFunction
  ): Promise<ExpressResponse | void> {
    try {
      const { ...data } = req.body;

      const zone = await prisma.zone.create({
        data: data,
      });

      return Response.send(res, 200, "Zone created successfully");
    } catch (error) {
      next(error);
    }
  }
  static async updateZone(
    req: AuthenticatedRequest,
    res: ExpressResponse,
    next: NextFunction
  ): Promise<ExpressResponse | void> {
    try {
      const { id } = req.params;
      const { ...data } = req.body;

      const zone = await prisma.zone.update({
        where: { id: Number(id) },
        data: data,
      });

      return Response.send(res, 200, "Zone updated successfully", zone);
    } catch (error) {
      next(error);
    }
  }
  static async deleteZone(
    req: AuthenticatedRequest,
    res: ExpressResponse,
    next: NextFunction
  ): Promise<ExpressResponse | void> {
    try {
      const { id } = req.params;

      const zone = await prisma.zone.delete({
        where: { id: Number(id) },
      });

      return Response.send(res, 200, "Zone deleted successfully", zone);
    } catch (error) {
      next(error);
    }
  }
}
