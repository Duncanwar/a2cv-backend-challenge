import { Response as ExpressResponse, NextFunction, Request } from "express";
import { validationResult } from 'express-validator';
import { prisma } from "../../config/database";
import PwdService from "../../services/bcrypt";
import JWTService from "../../services/jwt";
import Response from "../../services/response";
import { BadRequestException, NotFoundException } from "../../utils/exception";
import { LoginDTO, AuthSingUpDTO } from "./dto";

export default class AuthController {
  static async signUp(
    req: Request,
    res: ExpressResponse,
    next: NextFunction
  ): Promise<ExpressResponse | void> {
    try {
      // Validate request
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return Response.send(
          res,
          400,
          false,
          'Validation failed',
          null,
          errors.array().map(e => e.msg)
        )
      }

      const AuthData: AuthSingUpDTO = req.body
      if (!AuthData) {
        return Response.send(res, 400, false, 'Missing registration data')
      }

      // Email and username uniqueness already checked by validator
      AuthData.password = PwdService.hashPassword(AuthData.password)
      const user = await prisma.user.create({
        data: {
          ...AuthData,
        },
      })

      // Do not return password
      return Response.send(res, 201, true, 'User created successfully', {
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
        },
      })
    } catch (error) {
      next(error)
    }
  }

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
            username: user.username,
          });
          return Response.send(res, 201, true, "User LoggedIn successfully", {
            user: {
              id: user.id,
              email: user.email,
              username: user.username,
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
