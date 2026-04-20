import * as productService from "../services/product.service.js";

export const renderSubmitPage = (req, res) => {
  res.render("pages/submit.njk", { user: req.user });
};

export const handleUpvote = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const { action, count } = await productService.toggleUpvote(userId, id);

    return res.status(200).json({ action, count });
  } catch (error) {
    console.error("Erro ao dar upvote:", error);
    return res.status(500).json({ error: "Erro ao registrar upvote" });
  }
};

export const submitProduct = async (req, res) => {
  try {
    const { name, url, taglines } = req.body;
    const file = req.file;

    if (!file) {
      return res.render("pages/submit.njk", {
        user: req.user,
        error: "A logo é obrigatória.",
      });
    }

    const logoUrl = await productService.uploadLogo(file);

    const newProduct = await productService.createProduct({
      name,
      url,
      taglines,
      logo_url: logoUrl,
      user_id: req.user.id,
    });

    res.redirect(
      "/?success=" + encodeURIComponent("Projeto enviado com sucesso!"),
    );
  } catch (error) {
    console.error("Erro ao enviar projeto:", error);
    res.render("pages/submit.njk", {
      user: req.user,
      error: "Ocorreu um erro ao enviar seu projeto. Tente novamente.",
    });
  }
};
