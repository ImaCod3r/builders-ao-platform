import { supabase } from "../config/supabase.js";

export const createPost = async (title, content, authorId, imageUrls = []) => {
  const { data, error } = await supabase
    .from("posts")
    .insert([
      {
        title,
        content,
        author_id: authorId,
        image_urls: imageUrls,
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const getFeedPosts = async (userId = null) => {
  const { data: posts, error } = await supabase
    .from("posts")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  if (!posts || posts.length === 0) return [];

  // Obter autores (usando a tabela profiles ao invés de buscar a users do auth diretamente)
  const authorIds = [...new Set(posts.map((p) => p.author_id))];
  const { data: profiles } = await supabase
    .from("profiles")
    .select("user_id, full_name, avatar_url")
    .in("user_id", authorIds);

  const profilesMap = (profiles || []).reduce((acc, profile) => {
    acc[profile.user_id] = profile;
    return acc;
  }, {});

  // Enriquecer visualmente se o usuário deu like e formatar autores
  let userUpvotes = [];
  if (userId) {
    const { data: upvotesData } = await supabase
      .from("post_upvotes")
      .select("post_id")
      .eq("user_id", userId);

    if (upvotesData) {
      userUpvotes = upvotesData.map((u) => u.post_id);
    }
  }

  return posts.map((post) => {
    const authorProfile = profilesMap[post.author_id] || {};
    return {
      ...post,
      users: {
        id: post.author_id,
        name: authorProfile.full_name || "Usuário",
        avatar_url: authorProfile.avatar_url,
      },
      has_upvoted: userUpvotes.includes(post.id),
    };
  });
};

export const upvotePost = async (postId, userId) => {
  // Como não há garantia do RPC / Triggers criados via SQL no Dashboard,
  // controlamos a atomicidade do int4 localmente
  const { data: existing } = await supabase
    .from("post_upvotes")
    .select("*")
    .match({ post_id: postId, user_id: userId })
    .maybeSingle();

  if (existing) {
    // Como tem PK composta na post_upvotes
    await supabase
      .from("post_upvotes")
      .delete()
      .match({ post_id: postId, user_id: userId });

    const { data: post } = await supabase
      .from("posts")
      .select("upvote_count")
      .eq("id", postId)
      .single();
    const sum = Math.max(0, (post?.upvote_count || 0) - 1);
    await supabase.from("posts").update({ upvote_count: sum }).eq("id", postId);

    return { action: "removed", count: sum };
  } else {
    const { error: insertError } = await supabase
      .from("post_upvotes")
      .insert([{ post_id: postId, user_id: userId }]);

    if (insertError) throw insertError;

    const { data: post } = await supabase
      .from("posts")
      .select("upvote_count")
      .eq("id", postId)
      .single();
    const sum = (post?.upvote_count || 0) + 1;
    await supabase.from("posts").update({ upvote_count: sum }).eq("id", postId);

    return { action: "added", count: sum };
  }
};
