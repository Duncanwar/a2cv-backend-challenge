import { Response as ExpressResponse, NextFunction, Request } from "express";
import { prisma } from "../../config/database";
import Response from "../../services/response";
import { User } from "@prisma/client";

interface AuthenticatedRequest extends Request {
  user?: User;
}

export default class SubManagerController {
  static async registerSubManager(
    req: AuthenticatedRequest,
    res: ExpressResponse,
    next: NextFunction
  ): Promise<ExpressResponse | void> {
    try {
      const userDTO = req.body;

      if (!userDTO.role) {
        return Response.send(res, 400, "Role is required");
      }

      const user: User = await prisma.user.create({
        data: userDTO,
      });

      const subManager = await prisma.subManager.create({
        data: {
          userId: user.id,
        },
      });

      return Response.send(res, 201, "Manager created", { user, subManager });
    } catch (error) {
      next(error);
    }
  }
  static async getSubManager(
    req: AuthenticatedRequest,
    res: ExpressResponse,
    next: NextFunction
  ): Promise<ExpressResponse | void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const size = parseInt(req.query.size as string) || 10;

      const subManager = await prisma.subManager.findMany({
        skip: (page - 1) * size,
        take: size,
        include: {
          user: true,
        },
      });

      return Response.send(res, 200, "Submanagers retrieved successfully", {
        items: subManager,
        itemCount: subManager.length,
        itemsPerPage: size,
        currentPage: page,
      });
    } catch (error) {
      next(error);
    }
  }
  static async approveArrival(req: Request, res: ExpressResponse) {
    const { id } = req.params;
    const { busId } = req.body;
    console.log("no1");

    try {
      const dailyActivity = await prisma.dailyActivity.findFirst({
        where: {
          id: parseInt(id),
          busId: busId,
          busArrivalTime: null,
        },
      });
      console.log("no2");

      if (!dailyActivity) {
        return res
          .status(404)
          .json({ error: "No ongoing activity found for the specified bus" });
      }

      const updatedActivity = await prisma.dailyActivity.update({
        where: { id: parseInt(id) },
        data: {
          busArrivalTime: new Date(),
        },
      });

      return res.json({ message: "Bus arrival approved", updatedActivity });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ error: "Failed to approve bus arrival" });
    }
  }
  static async updateSubManager(
    req: AuthenticatedRequest,
    res: ExpressResponse,
    next: NextFunction
  ): Promise<ExpressResponse | void> {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const subManager = await prisma.subManager.findUnique({
        where: { id: Number(id) },
      });

      if (!subManager) {
        return Response.send(res, 404, "Sub Manager not found");
      }

      if (
        updateData.fullName ||
        updateData.email ||
        updateData.isActive !== undefined
      ) {
        const userData: any = {};
        if (updateData.fullName) userData.fullName = updateData.fullName;
        if (updateData.email) userData.email = updateData.email;

        await prisma.user.update({
          where: { id: subManager.userId },
          data: userData,
        });
      }

      const updatedSubManager = await prisma.subManager.findUnique({
        where: { id: Number(id) },
        include: { user: true },
      });

      return Response.send(
        res,
        200,
        "Submanager updated successfully",
        updatedSubManager ?? {}
      );
    } catch (error) {
      next(error);
    }
  }

  static async deleteSubManager(
    req: AuthenticatedRequest,
    res: ExpressResponse,
    next: NextFunction
  ): Promise<ExpressResponse | void> {
    const { id } = req.params;
    const subManager = await prisma.subManager.delete({
      where: { id: Number(id) },
    });
    return Response.send(
      res,
      200,
      "delete a submanager successfully",
      subManager
    );
  }
}
