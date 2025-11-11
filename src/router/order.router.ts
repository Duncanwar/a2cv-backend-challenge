import { Router } from "express";
import OrderController, { createOrderValidators } from "../controller/Order/order";
import { authenticate } from "../middleware/authHandler";
import isUser from "../middleware/isUser";

const router: Router = Router();

router.post(
  "/",
  [authenticate, isUser, ...createOrderValidators],
  OrderController.createOrder
);

router.get("/", authenticate, OrderController.getOrders);
// router.get("/", authenticate, OrderController.getOrders);

export default router;

