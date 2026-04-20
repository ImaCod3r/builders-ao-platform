import { SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

export const supabase = new SupabaseClient(supabaseUrl, supabaseKey, {
  auth: {
    // Força o fluxo PKCE no lugar do Implicit (que usa '#' na URL)
    // para podermos receber o '?code=' no servidor Express.
    flowType: "pkce",
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false,
  },
});