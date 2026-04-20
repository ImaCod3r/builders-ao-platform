import { Router } from "express";
import multer from "multer";
import { checkAuth } from "../middlewares/checkAuth.js";
import {
  renderSubmitPage,
  renderMyProductsPage,
  submitProduct,
  handleUpvote,
  renderEditPage,
  editProduct,
  renderProductPage,
  handleProductDeletion,
} from "../controllers/product.controller.js";

const upload = multer({ storage: multer.memoryStorage() });
const productRouter = Router();

const productUpload = upload.fields([
  { name: "logo", maxCount: 1 },
  { name: "images", maxCount: 5 },
]);

productRouter.get("/product/:slug", renderProductPage);
productRouter.get("/submit", checkAuth, renderSubmitPage);
productRouter.get("/my-products", checkAuth, renderMyProductsPage);
productRouter.post("/submit", checkAuth, productUpload, submitProduct);
productRouter.get("/edit-product/:id", checkAuth, renderEditPage);
productRouter.post(
  "/edit-product/:id",
  checkAuth,
  productUpload,
  editProduct,
);
productRouter.post("/products/:id/upvote", checkAuth, handleUpvote);
productRouter.post("/products/:id/delete", checkAuth, handleProductDeletion);

export default productRouter;
