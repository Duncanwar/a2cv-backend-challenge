import { Router } from "express";
import ProductController, {
  createProductValidators,
  updateProductValidators,
} from "../controller/product/product";
import { authenticate } from "../middleware/authHandler";
import isAdmin from "../middleware/isAdmin";

const router: Router = Router();

// Public endpoints
router.get("/", ProductController.getProducts);
router.get("/:id", ProductController.getProductById);

// Admin-only endpoints
router.post("/", [
  authenticate,
  isAdmin,
  ...createProductValidators
], ProductController.createProduct);

router.put(
  "/:id",
  [authenticate, isAdmin, ...updateProductValidators],
  ProductController.updateProduct
);

router.delete(
  "/:id",
  [authenticate, isAdmin],
  ProductController.deleteProduct
);

export default router;
