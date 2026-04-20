import { Router } from "express";
import multer from "multer";
import { checkAuth } from "../middlewares/checkAuth.js";
import {
  renderSubmitPage,
  submitProduct,
  handleUpvote,
} from "../controllers/product.controller.js";

const upload = multer({ storage: multer.memoryStorage() });
const productRouter = Router();

productRouter.get("/submit", checkAuth, renderSubmitPage);
productRouter.post("/submit", checkAuth, upload.single("logo"), submitProduct);
productRouter.post("/products/:id/upvote", checkAuth, handleUpvote);

export default productRouter;
