import { Response as ExpressResponse, NextFunction, Request } from "express";
import { prisma } from "../../config/database";
import Response from "../../services/response";

interface AuthenticatedRequest extends Request {}

export default class BusStopController {
  static async getBusStop(
    req: AuthenticatedRequest,
    res: ExpressResponse,
    next: NextFunction
  ): Promise<ExpressResponse | void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const size = parseInt(req.query.size as string) || 10;

      const busStop = await prisma.busStop.findMany({
        skip: (page - 1) * size,
        take: size,
        include: {
          buses: true,
          subManager: true,
          zone: true,
        },
      });

      return Response.send(res, 200, "Bus Stop retrieved successfully", {
        items: busStop,
        itemCount: busStop.length,
        itemsPerPage: size,
        currentPage: page,
      });
    } catch (error) {
      next(error);
    }
  }

  static async createBusStop(
    req: AuthenticatedRequest,
    res: ExpressResponse,
    next: NextFunction
  ): Promise<ExpressResponse | void> {
    try {
      const { busStopName, zoneId } = req.body;
      const busStop = await prisma.busStop.create({
        data: { busStopName: busStopName, zoneId: zoneId },
      });

      return Response.send(res, 201, "Bus Stop created successfully", busStop);
    } catch (error) {
      next(error);
    }
  }

  static async updateBusStop(
    req: AuthenticatedRequest,
    res: ExpressResponse,
    next: NextFunction
  ): Promise<ExpressResponse | void> {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const busStop = await prisma.busStop.update({
        where: { id: Number(id) },
        data: updateData,
      });

      return Response.send(res, 200, "Bus Stop updated successfully", busStop);
    } catch (error) {
      next(error);
    }
  }

  static async deleteBusStop(
    req: AuthenticatedRequest,
    res: ExpressResponse,
    next: NextFunction
  ): Promise<ExpressResponse | void> {
    try {
      const { id } = req.params;

      const busStop = await prisma.busStop.delete({
        where: { id: Number(id) },
      });

      return Response.send(res, 200, "Bus Stop deleted successfully", busStop);
    } catch (error) {
      next(error);
    }
  }
}
