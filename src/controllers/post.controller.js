import {
  createPost,
  getFeedPosts,
  upvotePost,
  getPostById,
  updatePost,
  deletePost,
} from "../services/post.service.js";
import { supabase } from "../config/supabase.js";

export const renderCreatePost = (req, res) => {
  res.render("pages/create-post.njk", { user: req.user });
};

export const renderEditPost = async (req, res) => {
  try {
    const post = await getPostById(req.params.id);
    if (post.author_id !== req.user.id) {
      return res.redirect("/feed?error=NÃ£o autorizado");
    }
    res.render("pages/edit-post.njk", { user: req.user, post });
  } catch (error) {
    console.error("Erro ao carregar post para ediÃ§Ã£o:", error);
    res.redirect("/feed?error=Post nÃ£o encontrado.");
  }
};

export const handleUpdatePost = async (req, res) => {
  try {
    const { title, content, existing_images } = req.body;
    let urls = [];

    if (existing_images) {
      if (Array.isArray(existing_images)) {
        urls = [...existing_images];
      } else {
        urls.push(existing_images);
      }
    }

    // Upload each image manually sent with the form
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const fileExt = file.originalname.split(".").pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${req.user.id}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("post_images")
          .upload(filePath, file.buffer, {
            contentType: file.mimetype,
          });

        if (uploadError) throw uploadError;

        const {
          data: { publicUrl },
        } = supabase.storage.from("post_images").getPublicUrl(filePath);

        urls.push(publicUrl);
      }
    }

    await updatePost(req.params.id, title, content, req.user.id, urls);
    res.redirect("/feed?success=Post atualizado com sucesso!");
  } catch (error) {
    console.error("Erro ao atualizar post:", error);
    res.redirect("/feed?error=Erro ao atualizar o post.");
  }
};

export const handleDeletePost = async (req, res) => {
  try {
    await deletePost(req.params.id, req.user.id);
    res.json({ success: true });
  } catch (error) {
    console.error("Erro ao excluir post:", error);
    res.status(500).json({ success: false, error: "Erro ao excluir o post." });
  }
};

export const handleCreatePost = async (req, res) => {
  try {
    const { title, content } = req.body;
    let urls = [];

    // Upload each image manually sent with the form
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const fileExt = file.originalname.split(".").pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${req.user.id}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("post_images")
          .upload(filePath, file.buffer, {
            contentType: file.mimetype,
          });

        if (uploadError) throw uploadError;

        const {
          data: { publicUrl },
        } = supabase.storage.from("post_images").getPublicUrl(filePath);

        urls.push(publicUrl);
      }
    }

    await createPost(title, content, req.user.id, urls);
    res.redirect("/feed?success=Post criado com sucesso!");
  } catch (error) {
    console.error("Erro ao criar post:", error);
    res.render("pages/create-post.njk", {
      user: req.user,
      error: "Erro ao criar post.",
    });
  }
};

export const renderFeed = async (req, res) => {
  try {
    const posts = await getFeedPosts(req.user?.id);
    res.render("pages/feed.njk", {
      user: req.user,
      posts,
      success: req.query.success,
    });
  } catch (error) {
    console.error("Erro ao carregar feed:", error);
    res.render("pages/feed.njk", {
      user: req.user,
      error: "Erro ao carregar posts.",
    });
  }
};

export const handleUpvote = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await upvotePost(id, req.user.id);
    res.json({ success: true, action: result.action });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, error: "Erro ao processar curtida" });
  }
};

export const handleImageUpload = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Nenhuma imagem enviada." });
    }

    const file = req.file;
    const fileExt = file.originalname.split(".").pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${req.user.id}/${fileName}`;

    const { data, error } = await supabase.storage
      .from("post_images")
      .upload(filePath, file.buffer, {
        contentType: file.mimetype,
      });

    if (error) throw error;

    const {
      data: { publicUrl },
    } = supabase.storage.from("post_images").getPublicUrl(filePath);

    res.json({ url: publicUrl });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro no upload da imagem." });
  }
};
