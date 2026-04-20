import { supabase } from "../config/supabase.js";

/**
 * Middleware para resgatar o usuário logado via cookies (usado globalmente para views).
 * Não bloqueia a rota, apenas preenche o req.user e res.locals.user.
 */
export const getUserSession = async (req, res, next) => {
  const token = req.cookies["sb-access-token"];

  if (token) {
    // Validar token no Supabase e buscar dados do usuário
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);

    if (!error && user) {
      req.user = user;
      // Disponibilizar o usuário automaticamente para qualquer view Nunjucks (.njk)
      res.locals.user = user;
    }
  }

  next();
};

/**
 * Middleware de proteção de rota: apenas usuários autenticados entram.
 * Caso contrário, envia para a tela de login.
 */
export const checkAuth = async (req, res, next) => {
  // Como depende do getUserSession, caso req.user já exista, apenas continua
  if (req.user) {
    return next();
  }

  // Se chegou aqui e não tem req.user, não está logado
  res.redirect("/login");
};
