import { Request, Response, NextFunction } from "express";
import { validationResult } from "express-validator";
import { prisma } from "../../config/database";
import ResponseService from "../../services/response";
import { body } from "express-validator";

export const createOrderValidators = [
  body("items")
    .isArray({ min: 1 })
    .withMessage("Items must be a non-empty array"),
  body("items.*.productId")
    .isUUID()
    .withMessage("Each productId must be a valid UUID"),
  body("items.*.quantity")
    .isInt({ min: 1 })
    .withMessage("Each quantity must be a positive integer"),
];

export default class OrderController {
  static async createOrder(
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

      if (!req.user || !req.user.id) {
        return ResponseService.send(
          res,
          401,
          false,
          "Unauthorized: User information is missing",
          null
        );
      }

      const { items } = req.body;
      console.log(req.body)
      const userId = req.user.id;

      // Validate and fetch all products in a single query
      const productIds = items.map((item: { productId: string }) => item.productId);
      const products = await prisma.product.findMany({
        where: {
          id: {
            in: productIds,
          },
        },
      });

      // Check if all products exist
      if (products.length !== productIds.length) {
        const foundIds = new Set(products.map((p) => p.id));
        const missingIds = productIds.filter((id: string) => !foundIds.has(id));
        return ResponseService.send(
          res,
          404,
          false,
          `Product(s) not found: ${missingIds.join(", ")}`,
          null
        );
      }

      // Check stock availability and prepare order items
      const orderItems: Array<{
        productId: string;
        quantity: number;
        price: number;
      }> = [];
      let totalPrice = 0;

      for (const item of items) {
        const product = products.find((p) => p.id === item.productId);
        if (!product) {
          return ResponseService.send(
            res,
            404,
            false,
            `Product not found: ${item.productId}`,
            null
          );
        }

        if (product.stock < item.quantity) {
          return ResponseService.send(
            res,
            400,
            false,
            `Insufficient stock for Product ${product.name}. Available: ${product.stock}, Requested: ${item.quantity}`,
            null
          );
        }

        const itemPrice = product.price * item.quantity;
        totalPrice += itemPrice;

        orderItems.push({
          productId: product.id,
          quantity: item.quantity,
          price: product.price,
        });
      }

      // Create order and order items in a transaction
      const result = await prisma.$transaction(async (tx) => {
        // Re-fetch products within transaction to check stock atomically
        const productsInTx = await tx.product.findMany({
          where: {
            id: {
              in: productIds,
            },
          },
        });

        // Verify stock availability again within transaction
        for (const item of items) {
          const product = productsInTx.find((p) => p.id === item.productId);
          if (!product) {
            throw new Error(`Product not found: ${item.productId}`);
          }
          if (product.stock < item.quantity) {
            throw new Error(
              `Insufficient stock for Product ${product.name}. Available: ${product.stock}, Requested: ${item.quantity}`
            );
          }
        }

        // Create the order
        const order = await tx.order.create({
          data: {
            userId,
            totalPrice,
            status: "pending",
          },
        });

        // Create order items and update product stock
        const createdOrderItems = await Promise.all(
          orderItems.map(async (item) => {
            // Update product stock (decrement within transaction)
            await tx.product.update({
              where: { id: item.productId },
              data: {
                stock: {
                  decrement: item.quantity,
                },
              },
            });

            // Create order item
            return tx.productOrder.create({
              data: {
                orderId: order.id,
                productId: item.productId,
                quantity: item.quantity,
                price: item.price,
              },
            });
          })
        );

        // Fetch the complete order with items
        return tx.order.findUnique({
          where: { id: order.id },
          include: {
            items: {
              include: {
                product: {
                  select: {
                    id: true,
                    name: true,
                    description: true,
                    category: true,
                  },
                },
              },
            },
          },
        });
      });

      return ResponseService.send(
        res,
        201,
        true,
        "Order placed successfully",
        result
      );
    } catch (error: any) {
      // Handle transaction errors (stock issues, etc.)
      if (error.message && error.message.includes("Insufficient stock")) {
        return ResponseService.send(
          res,
          400,
          false,
          error.message,
          null
        );
      }
      if (error.message && error.message.includes("Product not found")) {
        return ResponseService.send(
          res,
          404,
          false,
          error.message,
          null
        );
      }
      next(error);
    }
  }

  static async getOrders(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      if (!req.user || !req.user.id) {
        return ResponseService.send(
          res,
          401,
          false,
          "Unauthorized: User information is missing",
          null
        );
      }

      const userId = req.user.id;

      const orders = await prisma.order.findMany({
        where: {
          userId,
        },
        select: {
          id: true,
          status: true,
          totalPrice: true,
          createdAt: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      return ResponseService.send(
        res,
        200,
        true,
        "Orders retrieved",
        orders
      );
    } catch (error) {
      next(error);
    }
  }
}

