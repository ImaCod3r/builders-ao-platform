import { Router } from "express";
import multer from "multer";
import { checkAuth } from "../middlewares/checkAuth.js";
import {
  renderCreatePost,
  handleCreatePost,
  renderFeed,
  handleUpvote,
  handleImageUpload,
} from "../controllers/post.controller.js";

const postRouter = Router();

// Configurando Multer em memória
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB
  },
});

postRouter.get("/feed", renderFeed);
postRouter.get("/create", checkAuth, renderCreatePost);
postRouter.post(
  "/create",
  checkAuth,
  upload.array("images", 4),
  handleCreatePost,
);
postRouter.post("/:id/upvote", checkAuth, handleUpvote);
postRouter.post(
  "/upload-image",
  checkAuth,
  upload.single("image"),
  handleImageUpload,
);

export default postRouter;
