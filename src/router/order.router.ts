import { Router } from "express";
import OrderController, { createOrderValidators } from "../controller/Order/order";
import { authenticate } from "../middleware/authHandler";
import isUser from "../middleware/isUser";
import { validateRequest } from "../middleware/validateRequest";

const router: Router = Router();

router.post(
  "/",
  [authenticate, isUser, ...createOrderValidators, validateRequest],
  OrderController.createOrder
);

router.get("/", authenticate, OrderController.getOrders);

export default router;

