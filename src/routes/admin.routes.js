import { Router } from "express";
import { checkAdmin } from "../middlewares/checkAuth.js";

const router = Router();

router.use(checkAdmin);

router.get("/dashboard", (req, res) => {
  const pendingProjects = [];

  res.render("pages/admin/dashboard.njk", { pendingProjects });
});

router.post("/projects/:id/approve", (req, res) => {
  res.redirect("/admin/dashboard?success=approved");
});

router.post("/projects/:id/reject", (req, res) => {
  res.redirect("/admin/dashboard?success=rejected");
});

export default router;