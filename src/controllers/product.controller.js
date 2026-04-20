import * as productService from "../services/product.service.js";

export const renderSubmitPage = (req, res) => {
  res.render("pages/submit.njk", { user: req.user });
};

export const renderMyProductsPage = async (req, res) => {
  try {
    const products = await productService.getUserProducts(req.user.id);
    res.render("pages/my-products.njk", {
      user: req.user,
      products,
      success: req.query.success,
    });
  } catch (error) {
    console.error("Erro ao buscar meus produtos:", error);
    res.render("pages/my-products.njk", {
      user: req.user,
      products: [],
      error: "Erro ao carregar seus produtos.",
    });
  }
};
export const renderProductPage = async (req, res) => {
  try {
    const { slug } = req.params;
    const userId = req.user?.id || null;
    const product = await productService.getProductBySlug(slug, userId);

    if (!product) {
      return res.status(404).render("pages/home.njk", {
        user: req.user,
        projects: [],
        error: "Produto não encontrado.",
      });
    }

    res.render("pages/product.njk", { user: req.user, product });
  } catch (error) {
    console.error("Erro ao buscar produto por slug:", error);
    res.redirect(
      "/?error=" + encodeURIComponent("Erro ao carregar o produto."),
    );
  }
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

export const renderEditPage = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await productService.getProductById(id, req.user.id);

    if (!product) {
      return res.redirect("/my-products");
    }

    res.render("pages/edit-product.njk", { user: req.user, product });
  } catch (error) {
    console.error("Erro ao buscar produto para edição:", error);
    res.redirect("/my-products");
  }
};

export const editProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, url, taglines, description } = req.body;
    const file = req.file;

    let logoUrl;
    if (file) {
      logoUrl = await productService.uploadLogo(file);
    }

    await productService.updateProduct(id, req.user.id, {
      name,
      url,
      taglines,
      description,
      logo_url: logoUrl,
    });

    res.redirect(
      "/my-products?success=" +
        encodeURIComponent("Projeto atualizado com sucesso!"),
    );
  } catch (error) {
    console.error("Erro ao atualizar projeto:", error);
    // Para simplificar a exibição de erro, pegamos os dados de volta do banco
    const product = await productService.getProductById(
      req.params.id,
      req.user.id,
    );
    res.render("pages/edit-product.njk", {
      user: req.user,
      product,
      error: "Ocorreu um erro ao atualizar seu projeto. Tente novamente.",
    });
  }
};

export const submitProduct = async (req, res) => {
  try {
    const { name, url, taglines, description } = req.body;
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
      description,
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
