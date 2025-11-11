import { Request, Response, NextFunction } from "express";
import { prisma } from "../../config/database";
import ResponseService from "../../services/response";
import { body } from "express-validator";
import { requireAuth, sendUnauthorized } from "../../utils/helpers";
import GenericService from "../../services/generic";

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
  private static productService = new GenericService("product");
  private static orderService = new GenericService("order");
  private static productOrderService = new GenericService("productOrder");

  static async createOrder(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const user = requireAuth(req);
      if (!user) return sendUnauthorized(res);

      const { items } = req.body;
      const productIds = items.map((item: { productId: string }) => item.productId);

      const result = await prisma.$transaction(async (tx) => {
        // Fetch products within transaction for atomic stock check
        const productService = new GenericService("product");
        productService["model"] = tx.product;
        const products = await productService.findMany({
          where: { id: { in: productIds } },
        });

        // Validate products exist
        if (products.length !== productIds.length) {
          const foundIds = new Set(products.map((p: any) => p.id));
          const missingIds = productIds.filter((id: string) => !foundIds.has(id));
          throw new Error(`Product(s) not found: ${missingIds.join(", ")}`);
        }

        // Validate stock and calculate total
        let totalPrice = 0;
        const orderItems: Array<{ productId: string; quantity: number; price: number }> = [];

        for (const item of items) {
          const product = products.find((p: any) => p.id === item.productId);
          if (!product) throw new Error(`Product not found: ${item.productId}`);
          
          if (product.stock < item.quantity) {
            throw new Error(
              `Insufficient stock for Product ${product.name}. Available: ${product.stock}, Requested: ${item.quantity}`
            );
          }

          totalPrice += product.price * item.quantity;
          orderItems.push({
            productId: product.id,
            quantity: item.quantity,
            price: product.price,
          });
        }

        // Create order
        const orderService = new GenericService("order");
        orderService["model"] = tx.order;
        const order = await orderService.create({
          userId: user.id,
          totalPrice,
          status: "pending",
        });

        // Create order items and update stock
        const productOrderService = new GenericService("productOrder");
        productOrderService["model"] = tx.productOrder;
        
        await Promise.all(
          orderItems.map(async (item) => {
            await productService.update(
              { id: item.productId },
              { stock: { decrement: item.quantity } }
            );

            return productOrderService.create({
              orderId: order.id,
              productId: item.productId,
              quantity: item.quantity,
              price: item.price,
            });
          })
        );

        // Return complete order
        return orderService.findUnique(
          { id: order.id },
          {
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
          }
        );
      });

      return ResponseService.send(
        res,
        201,
        true,
        "Order placed successfully",
        result
      );
    } catch (error: any) {
      if (error.message?.includes("Insufficient stock")) {
        return ResponseService.send(res, 400, false, error.message, null);
      }
      if (error.message?.includes("Product not found")) {
        return ResponseService.send(res, 404, false, error.message, null);
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
      const user = requireAuth(req);
      if (!user) return sendUnauthorized(res);

      const orders = await this.orderService.findMany({
        where: { userId: user.id },
        select: {
          id: true,
          status: true,
          totalPrice: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
      });

      return ResponseService.send(res, 200, true, "Orders retrieved", orders);
    } catch (error) {
      next(error);
    }
  }
}

