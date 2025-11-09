import { Response as ExpressResponse, NextFunction, Request } from "express";
import { prisma } from "../../config/database";
import Response from "../../services/response";
import { User } from "@prisma/client";

interface AuthenticatedRequest extends Request {
  user?: User;
}

export default class BusesController {
  static async getBuses(
    req: AuthenticatedRequest,
    res: ExpressResponse,
    next: NextFunction
  ): Promise<ExpressResponse | void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const size = parseInt(req.query.size as string) || 10;

      const bus = await prisma.bus.findMany({
        skip: (page - 1) * size,
        take: size,
        include: {
          busStop: true,
          zone: true,
        },
      });

      return Response.send(res, 200, "Bus retrieved successfully", {
        items: bus,
        itemCount: bus.length,
        itemsPerPage: size,
        currentPage: page,
      });
    } catch (error) {
      next(error);
    }
  }
  static async createBus(
    req: AuthenticatedRequest,
    res: ExpressResponse,
    next: NextFunction
  ): Promise<ExpressResponse | void> {
    try {
      const { plateNo, zoneId, busStopId, status } = req.body;

      const bus = await prisma.bus.create({
        data: {
          plateNo: plateNo,
          zoneId: zoneId,
          busStopId: busStopId,
          status,
        },
      });

      return Response.send(res, 201, "Bus created", bus);
    } catch (error) {
      next(error);
    }
  }
  static async updateBus(
    req: AuthenticatedRequest,
    res: ExpressResponse,
    next: NextFunction
  ): Promise<ExpressResponse | void> {
    try {
      const { id } = req.params;
      const { plateNo, zoneId, busStopId, status } = req.body;

      const bus = await prisma.bus.update({
        where: { id: Number(id) },
        data: {
          plateNo: plateNo,
          zoneId: zoneId,
          busStopId: busStopId,
          status: status,
        },
      });

      return Response.send(res, 201, "Bus updated", bus);
    } catch (error) {
      next(error);
    }
  }
  static async deleteBus(
    req: AuthenticatedRequest,
    res: ExpressResponse,
    next: NextFunction
  ): Promise<ExpressResponse | void> {
    try {
      const { id } = req.params;

      const bus = await prisma.bus.delete({
        where: { id: Number(id) },
      });

      return Response.send(res, 200, "Bus deleted", bus);
    } catch (error) {
      next(error);
    }
  }
}
