import { SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

// Instância LIMPA para usar no banco de dados e validações gerais.
// Como não roda o "exchangeCodeForSession", sempre usará o service_role
// corretamente, sem expirar e sem misturar sessão de usuários!
export const supabase = new SupabaseClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
});

// Instância SEPARADA que serve EXCLUSIVAMENTE para gerenciar o fluxo de OAuth.
// Ela consegue reter o PKCE code verifier na memória entre a ida pro Google e a volta.
export const supabaseAuthClient = new SupabaseClient(supabaseUrl, supabaseKey, {
  auth: {
    flowType: "pkce",
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false,
  },
});
