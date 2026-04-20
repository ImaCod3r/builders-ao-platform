import { Router } from "express";
import auth from "./auth.routes.js";
import admin from "./admin.routes.js";
import user from "./user.routes.js";
import { checkAuth } from "../middlewares/checkAuth.js";
import productRouter from "./product.routes.js";
import { getPublishedProducts } from "../services/product.service.js";

const indexRouter = Router();

indexRouter.get("/", async (req, res) => {
  try {
    const projects = await getPublishedProducts(req.user?.id);
    const success = req.query.success;
    res.render("pages/home.njk", { user: req.user, projects, success });
  } catch (error) {
    console.error("Erro ao buscar projetos:", error);
    res.render("pages/home.njk", {
      user: req.user,
      projects: [],
      error: "Erro ao carregar os projetos.",
    });
  }
});

indexRouter.get("/login", (req, res) => {
  const error = req.query.error;
  res.render("pages/login.njk", { error });
});

indexRouter.use("/auth", auth);
indexRouter.use("/admin", checkAuth, admin);
indexRouter.use("/", user);
indexRouter.use("/", productRouter);

export default indexRouter;
