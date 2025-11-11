import { Request, Response, NextFunction } from "express";
import { validationResult } from "express-validator";
import { prisma } from "../../config/database";
import ResponseService from "../../services/response";
import { body } from "express-validator";

// Extend Express Request interface to include user property
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role?: string;
      };
    }
  }
}

export const createProductValidators = [
  body("name")
    .isString()
    .withMessage("Name must be a string")
    .isLength({ min: 3, max: 100 })
    .withMessage("Name must be between 3 and 100 characters")
    .notEmpty()
    .withMessage("Name is required"),
  body("description")
    .isString()
    .withMessage("Description must be a string")
    .isLength({ min: 10 })
    .withMessage("Description must be at least 10 characters")
    .notEmpty()
    .withMessage("Description is required"),
  body("price")
    .isFloat({ gt: 0 })
    .withMessage("Price must be a positive number greater than 0"),
  body("stock")
    .isInt({ min: 0 })
    .withMessage("Stock must be a non-negative integer"),
  body("category")
    .optional()
    .isString()
    .withMessage("Category must be a string"),
];

export const updateProductValidators = [
  body("name")
    .optional()
    .isString()
    .withMessage("Name must be a string")
    .isLength({ min: 3, max: 100 })
    .withMessage("Name must be between 3 and 100 characters"),
  body("description")
    .optional()
    .isString()
    .withMessage("Description must be a string")
    .isLength({ min: 10 })
    .withMessage("Description must be at least 10 characters"),
  body("price")
    .optional()
    .isFloat({ gt: 0 })
    .withMessage("Price must be a positive number greater than 0"),
  body("stock")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Stock must be a non-negative integer"),
];

export default class ProductController {
  static async createProduct(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return ResponseService.send(
          res,
          400,
          false,
          "Validation failed",
          null,
          errors.array().map((e) => e.msg)
        );
      }

      const { name, description, price, stock, category } = req.body;
console.log(req.body);
      if (!req.user || !req.user.id) {
        return ResponseService.send(
          res,
          401,
          false,
          "Unauthorized: User information is missing",
          null
        );
      }

      const product = await prisma.product.create({
        data: {
          name,
          description,
          price: Number(price),
          stock: Number(stock),
          category,
          userId: req.user.id, // assuming req.user is set by auth middleware
        },
      });

      return ResponseService.send(res, 201, true, "Product created", product);
    } catch (error) {
      next(error);
    }
  }

  static async updateProduct(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return ResponseService.send(
          res,
          400,
          false,
          "Validation failed",
          null,
          errors.array().map((e) => e.msg)
        );
      }

      const { id } = req.params;
      const { name, description, price, stock } = req.body;

      const dataToUpdate: {
        name?: string;
        description?: string;
        price?: number;
        stock?: number;
      } = {};

      if (name !== undefined) {
        dataToUpdate.name = name;
      }
      if (description !== undefined) {
        dataToUpdate.description = description;
      }
      if (price !== undefined) {
        dataToUpdate.price = Number(price);
      }
      if (stock !== undefined) {
        dataToUpdate.stock = Number(stock);
      }

      if (Object.keys(dataToUpdate).length === 0) {
        return ResponseService.send(
          res,
          400,
          false,
          "No valid fields provided for update",
          null
        );
      }

      const existingProduct = await prisma.product.findUnique({
        where: { id },
      });

      if (!existingProduct) {
        return ResponseService.send(
          res,
          404,
          false,
          "Product not found",
          null
        );
      }

      const updatedProduct = await prisma.product.update({
        where: { id },
        data: dataToUpdate,
      });

      return ResponseService.send(
        res,
        200,
        true,
        "Product updated",
        updatedProduct
      );
    } catch (error) {
      next(error);
    }
  }

  static async getProducts(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || parseInt(req.query.pageSize as string) || 10;
      const search = (req.query.search as string) || "";

      const pageNumber = Math.max(1, page);
      const pageSize = Math.max(1, limit);
      const skip = (pageNumber - 1) * pageSize;

      const whereClause = search
        ? {
            name: {
              contains: search,
              mode: "insensitive" as const,
            },
          }
        : {};

      const [products, totalProducts] = await Promise.all([
        prisma.product.findMany({
          where: whereClause,
          select: {
            id: true,
            name: true,
            price: true,
            stock: true,
            category: true,
          },
          skip,
          take: pageSize,
        }),
        prisma.product.count({
          where: whereClause,
        }),
      ]);

      const totalPages = Math.ceil(totalProducts / pageSize);

      return ResponseService.send(res, 200, true, "Products retrieved", {
        currentPage: pageNumber,
        pageSize,
        totalPages,
        totalProducts,
        products,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getProductById(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const { id } = req.params;

      const product = await prisma.product.findUnique({
        where: { id },
      });

      if (!product) {
        return ResponseService.send(
          res,
          404,
          false,
          "Product not found",
          null
        );
      }

      return ResponseService.send(res, 200, true, "Product retrieved", product);
    } catch (error) {
      next(error);
    }
  }

  static async deleteProduct(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const { id } = req.params;

      const existingProduct = await prisma.product.findUnique({
        where: { id },
      });

      if (!existingProduct) {
        return ResponseService.send(
          res,
          404,
          false,
          "Product not found",
          null
        );
      }

      await prisma.product.delete({
        where: { id },
      });

      return ResponseService.send(
        res,
        200,
        true,
        "Product deleted successfully",
        null
      );
    } catch (error) {
      next(error);
    }
  }
}
