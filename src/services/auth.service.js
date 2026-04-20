import { supabase } from "../config/supabase.js";

export const signInWithGoogle = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${process.env.APP_URL || "http://localhost:3000"}/auth/callback`,
    },
  });

  if (error) {
    throw new Error(`Erro ao gerar URL do Google Auth: ${error.message}`);
  }

  return data.url;
};

export const exchangeCodeForSession = async (code) => {
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    throw new Error(`Erro ao trocar código por sessão: ${error.message}`);
  }

  return data.session;
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();

  if (error) {
    throw new Error(`Erro ao fazer logout: ${error.message}`);
  }
};