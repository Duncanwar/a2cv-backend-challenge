import { Request, Response, NextFunction } from "express";
import ResponseService from "../../services/response";
import { body } from "express-validator";
import { requireAuth, sendUnauthorized, sendNotFound, parsePaginationParams } from "../../utils/helpers";
import GenericService from "../../services/generic";

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
  private static productService = new GenericService("product");

  static async createProduct(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const user = requireAuth(req);
      if (!user) return sendUnauthorized(res);

      const { name, description, price, stock, category } = req.body;

      const product = await this.productService.create({
        name,
        description,
        price: Number(price),
        stock: Number(stock),
        category,
        userId: user.id,
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
      const { id } = req.params;
      const { name, description, price, stock } = req.body;

      const existingProduct = await this.productService.findUnique({ id });

      if (!existingProduct) return sendNotFound(res, "Product");

      const dataToUpdate: Record<string, any> = {};
      if (name !== undefined) dataToUpdate.name = name;
      if (description !== undefined) dataToUpdate.description = description;
      if (price !== undefined) dataToUpdate.price = Number(price);
      if (stock !== undefined) dataToUpdate.stock = Number(stock);

      if (Object.keys(dataToUpdate).length === 0) {
        return ResponseService.send(
          res,
          400,
          false,
          "No valid fields provided for update",
          null
        );
      }

      const updatedProduct = await this.productService.update(
        { id },
        dataToUpdate
      );

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
      const { pageNumber, pageSize, skip } = parsePaginationParams(req.query);
      const search = (req.query.search as string) || "";

      const whereClause = search
        ? {
            name: {
              contains: search,
              mode: "insensitive" as const,
            },
          }
        : {};

      const [products, totalProducts] = await Promise.all([
        this.productService.findMany({
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
        this.productService.count(whereClause),
      ]);

      return ResponseService.send(res, 200, true, "Products retrieved", {
        currentPage: pageNumber,
        pageSize,
        totalPages: Math.ceil(totalProducts / pageSize),
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
      const product = await this.productService.findUnique({ id });

      if (!product) return sendNotFound(res, "Product");

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
      const existingProduct = await this.productService.findUnique({ id });

      if (!existingProduct) return sendNotFound(res, "Product");

      await this.productService.delete({ id });

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
