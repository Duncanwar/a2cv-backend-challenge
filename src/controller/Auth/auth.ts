import { Response as ExpressResponse, NextFunction, Request } from "express";
import { validationResult } from 'express-validator';
import { prisma } from "../../config/database";
import PwdService from "../../services/bcrypt";
import JWTService from "../../services/jwt";
import Response from "../../services/response";
import { BadRequestException, NotFoundException } from "../../utils/exception";
import { LoginDTO, AuthSingUpDTO } from "./dto";
import { UnauthorizedException } from '../../utils/exception'

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

      const dto: LoginDTO = req.body;
      const user = await prisma.user.findFirst({
        where: {
          email: dto.email,
        },
      });
      if (!user) {
        // For security don't reveal whether user or password failed
        throw new UnauthorizedException('Invalid credentials')
      }

      const passwordMatch = PwdService.checkPassword(
        dto.password,
        user.password
      );
      if (!passwordMatch) {
        throw new UnauthorizedException('Invalid credentials')
      }

      const token = JWTService.signToken({
        id: user.id,
        email: user.email,
        username: user.username,
      });
      return Response.send(res, 200, true, 'Login successful', {
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
        },
        token,
      });
    } catch (error) {
      next(error);
    }
  }
}
