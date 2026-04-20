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
