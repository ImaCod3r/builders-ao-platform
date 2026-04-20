import { supabaseAuthClient } from "../config/supabase.js";

export const signInWithGoogle = async () => {
  const { data, error } = await supabaseAuthClient.auth.signInWithOAuth({
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
  const { data, error } =
    await supabaseAuthClient.auth.exchangeCodeForSession(code);

  if (error) {
    throw new Error(`Erro ao trocar código por sessão: ${error.message}`);
  }

  return data.session;
};

export const signOut = async (token) => {
  if (token) {
    const { SupabaseClient } = await import("@supabase/supabase-js");
    const ephemeralClient = new SupabaseClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_KEY,
      {
        global: { headers: { Authorization: `Bearer ${token}` } },
        auth: { persistSession: false },
      },
    );
    const { error } = await ephemeralClient.auth.signOut();
    if (error) {
      throw new Error(`Erro ao fazer logout: ${error.message}`);
    }
  }
};
