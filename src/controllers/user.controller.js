import { supabase } from "../config/supabase.js";
import { getUserProducts } from "../services/product.service.js";

export const renderProfilePage = async (req, res) => {
  try {
    const products = await getUserProducts(req.user.id);
    const success = req.query.success;
    const error = req.query.error;
    res.render("pages/profile-overview.njk", { 
      user: req.user, 
      products,
      success, 
      error 
    });
  } catch (error) {
    console.error("Erro ao carregar perfil:", error);
    res.redirect("/?error=profile_load_failed");
  }
};

export const renderProfileEditPage = async (req, res) => {
  const success = req.query.success;
  const error = req.query.error;
  res.render("pages/profile-edit.njk", { user: req.user, success, error });
};

export const updateProfile = async (req, res) => {
  const { full_name } = req.body;
  const avatarFile = req.file;
  const user = req.user;

  try {
    let avatarUrl = user.user_metadata.avatar_url;

    if (avatarFile) {
      const fileExt = avatarFile.originalname.split(".").pop();
      const fileName = `${user.id}-${Math.random()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, avatarFile.buffer, {
          contentType: avatarFile.mimetype,
          upsert: true,
        });

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);
      
      avatarUrl = publicUrlData.publicUrl;
    }

    const { error: authError } = await supabase.auth.admin.updateUserById(
      user.id,
      {
        user_metadata: {
          ...user.user_metadata,
          full_name: full_name,
          avatar_url: avatarUrl,
        },
      }
    );

    if (authError) throw authError;

    await supabase
      .from("profiles")
      .update({
        full_name: full_name,
        avatar_url: avatarUrl,
      })
      .eq("user_id", user.id);

    res.redirect("/profile?success=true");
  } catch (error) {
    console.error("Erro ao atualizar perfil:", error);
    res.render("pages/profile-edit.njk", {
      user,
      error: "Falha ao atualizar o perfil. Tente novamente.",
    });
  }
};
