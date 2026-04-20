import { supabase } from "../config/supabase.js";

const log = (level, message, meta = {}) => {
  const timestamp = new Date().toISOString();
  console[level](`[${timestamp}] [auth] ${message}`, meta);
};

export const getUserSession = async (req, res, next) => {
  const token = req.cookies["sb-access-token"];

  log("info", "getUserSession called", {
    path: req.path,
    hasToken: Boolean(token),
  });

  if (token) {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);

    if (error) {
      log("warn", "Invalid token or failed to fetch user from Supabase", {
        error: error.message,
      });
    }

    if (!error && user) {
      log("info", "Supabase user fetched", { userId: user.id });

      const { data: dbUser, error: dbError } = await supabase
        .from("profiles")
        .select("role")
        .eq("user_id", user.id)
        .single();

      if (dbError) {
        log("error", "Erro ao buscar role na tabela profiles", {
          userId: user.id,
          error: dbError.message,
        });
      }

      user.role = dbUser?.role || "user";

      req.user = user;
      res.locals.user = user;

      log("info", "User attached to request", {
        userId: user.id,
        role: user.role,
      });
    }
  } 
  next();
};

export const checkAuth = async (req, res, next) => {
  if (req.user) {
    log("info", "checkAuth passed", { userId: req.user.id, path: req.path });
    return next();
  }

  log("warn", "checkAuth failed, redirecting to /login", { path: req.path });
  res.redirect("/login");
};

export const checkAdmin = async (req, res, next) => {
  if (!req.user) {
    return res.redirect("/login");
  }

  if (req.user.role === "admin") {
    return next();
  }

  log("warn", "checkAdmin failed: forbidden", {
    userId: req.user.id,
    role: req.user.role,
    path: req.path,
  });
  
  res.redirect("/?error=forbidden");
};
