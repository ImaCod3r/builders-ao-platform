import { Router } from "express";
import { checkAdmin } from "../middlewares/checkAuth.js";
import {
  getPendingProducts,
  updateProductStatus,
} from "../services/product.service.js";

const router = Router();

router.use(checkAdmin);

router.get("/dashboard", async (req, res) => {
  try {
    const pendingProjects = await getPendingProducts();
    const success = req.query.success;
    res.render("pages/admin/dashboard.njk", {
      pendingProjects,
      user: req.user,
      success,
    });
  } catch (error) {
    console.error("Dashboard erro:", error);
    res.render("pages/admin/dashboard.njk", {
      pendingProjects: [],
      user: req.user,
      error: "Erro ao buscar projetos.",
    });
  }
});

router.post("/projects/:id/approve", async (req, res) => {
  try {
    await updateProductStatus(req.params.id, "published");
    res.redirect("/admin/dashboard?success=approved");
  } catch (error) {
    console.error("Aprovar erro:", error);
    res.redirect("/admin/dashboard?error=Erro ao aprovar");
  }
});

router.post("/projects/:id/reject", async (req, res) => {
  try {
    await updateProductStatus(req.params.id, "rejected");
    res.redirect("/admin/dashboard?success=rejected");
  } catch (error) {
    console.error("Rejeitar erro:", error);
    res.redirect("/admin/dashboard?error=Erro ao rejeitar");
  }
});

export default router;
