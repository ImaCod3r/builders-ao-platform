import * as authService from "../services/auth.service.js";

export const login = async (req, res) => {
  try {
    const url = await authService.signInWithGoogle();
    res.redirect(url);
  } catch (error) {
    console.error("Erro no controller de login:", error);
    res
      .status(500)
      .json({ error: "Erro interno ao iniciar login com o Google." });
  }
};

export const callback = async (req, res) => {
  const { code } = req.query;

  if (!code) {
    return res.status(400).send("Código de autorização não fornecido.");
  }

  try {
    const session = await authService.exchangeCodeForSession(code);

    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    };

    res.cookie("sb-access-token", session.access_token, {
      ...cookieOptions,
      maxAge: session.expires_in * 1000,
    });

    res.cookie("sb-refresh-token", session.refresh_token, {
      ...cookieOptions,
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });

    res.redirect("/");
  } catch (error) {
    console.error("Erro no callback OAuth:", error);
    res.redirect("/?error=auth_failed");
  }
};

export const logout = async (req, res) => {
  try {
    await authService.signOut();
    res.clearCookie("sb-access-token");
    res.clearCookie("sb-refresh-token");
    res.redirect("/");
  } catch (error) {
    console.error("Erro no controller de logout:", error);
    res.status(500).json({ error: "Erro ao deslogar o usuário." });
  }
};