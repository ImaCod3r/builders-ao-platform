import { supabase } from "../config/supabase.js";
import crypto from "crypto";

export const uploadLogo = async (file) => {
  const fileExt = file.originalname.split(".").pop();
  const fileName = `${crypto.randomUUID()}.${fileExt}`;
  const filePath = `${fileName}`;

  // Supondo que o supabase cliente tenha as credenciais corretas com permissões
  const { data, error } = await supabase.storage
    .from("logos")
    .upload(filePath, file.buffer, {
      contentType: file.mimetype,
      upsert: false,
    });

  if (error) {
    throw error;
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from("logos").getPublicUrl(filePath);

  return publicUrl;
};

export const uploadProductImages = async (files) => {
  const uploadPromises = files.map(async (file) => {
    const fileExt = file.originalname.split(".").pop();
    const fileName = `${crypto.randomUUID()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { data, error } = await supabase.storage
      .from("products-images")
      .upload(filePath, file.buffer, {
        contentType: file.mimetype,
        upsert: false,
      });

    if (error) throw error;

    const {
      data: { publicUrl },
    } = supabase.storage.from("products-images").getPublicUrl(filePath);

    return publicUrl;
  });

  return Promise.all(uploadPromises);
};

export const saveProductImages = async (productId, urls) => {
  const imageRecords = urls.map((url, index) => ({
    product_id: productId,
    url: url,
    sort_order: index,
  }));

  const { error } = await supabase.from("product_images").insert(imageRecords);

  if (error) throw error;
};

export const createProduct = async (productData) => {
  // Generate slug from name
  const slug = productData.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");

  const product = {
    name: productData.name,
    slug: slug,
    url: productData.url,
    logo_url: productData.logo_url,
    user_id: productData.user_id,
    status: "pending", // Supondo valor inicial do enumerable project_status
    taglines: productData.taglines,
    description: productData.description,
  };

  const { data, error } = await supabase
    .from("products")
    .insert([product])
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
};

export const getProductById = async (id, userId = null) => {
  let query = supabase.from("products").select("*").eq("id", id).single();

  if (userId) {
    query = query.eq("user_id", userId);
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return data;
};

export const getProductBySlug = async (slug, userId = null) => {
  let query = supabase
    .from("products")
    .select("*, upvotes(count), product_images(*)")
    .eq("slug", slug)
    .single();

  const { data: product, error } = await query;

  if (error) {
    if (error.code === "PGRST116") return null;
    throw error;
  }

  // Fetch creator profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, avatar_url")
    .eq("user_id", product.user_id)
    .maybeSingle();

  let has_upvoted = false;
  if (userId) {
    const { data: upvoteData } = await supabase
      .from("upvotes")
      .select("*")
      .eq("user_id", userId)
      .eq("product_id", product.id)
      .maybeSingle();

    if (upvoteData) has_upvoted = true;
  }

  return {
    ...product,
    upvotes_count: product.upvotes[0]?.count || 0,
    has_upvoted,
    creator: profile,
  };
};

export const updateProduct = async (id, userId, productData) => {
  const updatePayload = {
    name: productData.name,
    url: productData.url,
    taglines: productData.taglines,
    description: productData.description,
  };

  if (productData.name) {
    updatePayload.slug = productData.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");
  }

  if (productData.logo_url) {
    updatePayload.logo_url = productData.logo_url;
  }

  const { data, error } = await supabase
    .from("products")
    .update(updatePayload)
    .eq("id", id)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
};

export const getPendingProducts = async () => {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("status", "pending")
    .order("id", { ascending: false });

  if (error) {
    throw error;
  }

  return data;
};

export const getPublishedProducts = async (userId = null) => {
  console.log("GET PUB CALLED WITH:", userId);
  let query = supabase
    .from("products")
    .select("*, upvotes(count)")
    .eq("status", "published");

  const { data: products, error } = await query;

  if (error) {
    throw error;
  }

  let userUpvotes = [];
  if (userId) {
    const { data: upvotesData } = await supabase
      .from("upvotes")
      .select("product_id")
      .eq("user_id", userId);
    if (upvotesData) {
      userUpvotes = upvotesData.map((u) => u.product_id);
    }
  }

  const enrichedProducts = products.map((product) => ({
    ...product,
    upvotes_count: product.upvotes[0]?.count || 0,
    has_upvoted: userUpvotes.includes(product.id),
  }));

  // Sort by upvotes descending
  enrichedProducts.sort((a, b) => b.upvotes_count - a.upvotes_count);

  return enrichedProducts;
};

export const getUserProducts = async (userId) => {
  const { data, error } = await supabase
    .from("products")
    .select("*, upvotes(count)")
    .eq("user_id", userId)
    .order("id", { ascending: false });

  if (error) {
    throw error;
  }

  const enrichedProducts = data.map((product) => ({
    ...product,
    upvotes_count: product.upvotes[0]?.count || 0,
  }));

  return enrichedProducts;
};

export const updateProductStatus = async (id, status) => {
  const { data, error } = await supabase
    .from("products")
    .update({ status })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
};

export const toggleUpvote = async (userId, productId) => {
  // Check if upvote exists
  const { data: existingUpvote, error: fetchError } = await supabase
    .from("upvotes")
    .select("*")
    .eq("user_id", userId)
    .eq("product_id", productId)
    .maybeSingle();

  if (fetchError) throw fetchError;

  let action = "";
  if (existingUpvote) {
    // Remove upvote
    const { error: deleteError } = await supabase
      .from("upvotes")
      .delete()
      .eq("user_id", userId)
      .eq("product_id", productId);
    if (deleteError) throw deleteError;
    action = "removed";
  } else {
    // Add upvote
    const { error: insertError } = await supabase
      .from("upvotes")
      .insert([{ user_id: userId, product_id: productId }]);
    if (insertError) throw insertError;
    action = "added";
  }

  // Get new count
  const { count, error: countError } = await supabase
    .from("upvotes")
    .select("*", { count: "exact", head: true })
    .eq("product_id", productId);

  if (countError) throw countError;

  return { action, count };
};

export const deleteProduct = async (id, userId) => {
  const { data, error } = await supabase
    .from("products")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);

  if (error) {
    throw error;
  }

  return data;
};
