import { Router } from "express";
import multer from "multer";
import { checkAuth } from "../middlewares/checkAuth.js";
import { renderProfilePage, renderProfileEditPage, updateProfile } from "../controllers/user.controller.js";

const userLayoutRouter = Router();
const upload = multer({ 
    storage: multer.memoryStorage(),
    limits: { fileSize: 1024 * 1024 } // 1MB limit for avatars
});

userLayoutRouter.get("/profile", checkAuth, renderProfilePage);
userLayoutRouter.get("/profile/edit", checkAuth, renderProfileEditPage);
userLayoutRouter.post("/profile/edit", checkAuth, upload.single("avatar"), updateProfile);

export default userLayoutRouter;
