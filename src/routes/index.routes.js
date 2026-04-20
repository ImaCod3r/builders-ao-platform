import { Router } from "express";
import auth from "./auth.routes.js";
import admin from "./admin.routes.js";
import { checkAuth } from "../middlewares/checkAuth.js";
import productRouter from "./product.routes.js";

const indexRouter = Router();

indexRouter.get("/", (req, res) => {
  res.render("pages/home.njk", { user: req.user, projects: [] });
});

indexRouter.get("/login", (req, res) => {
  const error = req.query.error;
  res.render("pages/login.njk", { error });
});

indexRouter.use("/auth", auth);
indexRouter.use("/admin", checkAuth, admin);
indexRouter.use("/", productRouter);

export default indexRouter;
