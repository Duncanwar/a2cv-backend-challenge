import { Response as ExpressResponse, NextFunction, Request } from "express";
import { prisma } from "../../config/database";
import PwdService from "../../services/bcrypt";
import JWTService from "../../services/jwt";
import Response from "../../services/response";
import { BadRequestException, NotFoundException } from "../../utils/exception";
import { LoginDTO } from "./dto";

export default class AuthController {
  static async login(
    req: Request,
    res: ExpressResponse,
    next: NextFunction
  ): Promise<ExpressResponse | void> {
    try {
      const dto: LoginDTO = req.body;
      const user = await prisma.user.findFirst({
        where: {
          email: dto.email,
        },
      });
      console.log(user);
      if (!user) {
        throw new NotFoundException("User not found");
      } else {
        const passwordMatch = PwdService.checkPassword(
          dto.password,
          user.password
        );
        if (!passwordMatch) {
          throw new BadRequestException("Password is incorrect");
        } else {
          const token = JWTService.signToken({
            id: user.id,
            email: user.email,
            fullNames: user.fullName,
            role: user.role,
          });
          return Response.send(res, 201, "User LoggedIn successfully", {
            user: {
              id: user.id,
              email: user.email,
              role: user.role,
              fullName: user.fullName,
            },
            token,
          });
        }
      }
    } catch (error) {
      next(error);
    }
  }
}
