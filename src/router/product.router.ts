import { Router } from "express";
import ProductController, {
  createProductValidators,
  updateProductValidators,
} from "../controller/product/product";
import { authenticate } from "../middleware/authHandler";
import isAdmin from "../middleware/isAdmin";
import { validateRequest } from "../middleware/validateRequest";

const router: Router = Router();

// Public endpoints
router.get("/", ProductController.getProducts);
router.get("/:id", ProductController.getProductById);

// Admin-only endpoints
router.post(
  "/",
  [authenticate, isAdmin, ...createProductValidators, validateRequest],
  ProductController.createProduct
);

router.put(
  "/:id",
  [authenticate, isAdmin, ...updateProductValidators, validateRequest],
  ProductController.updateProduct
);

router.delete("/:id", [authenticate, isAdmin], ProductController.deleteProduct);

export default router;
