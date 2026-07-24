const { verifyToken } = require("../utils/jwt.util");

/**
 * Vérifie la présence et la validité du token JWT (header Authorization: Bearer <token>).
 * Attache le payload décodé à req.user pour les middlewares/contrôleurs suivants.
 */
function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const [scheme, token] = header.split(" ");

  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({ error: "Authentification requise." });
  }

  try {
    req.user = verifyToken(token); // { sub, phone, role, iat, exp }
    next();
  } catch (err) {
    return res.status(401).json({ error: "Session invalide ou expirée." });
  }
}

/**
 * Restreint l'accès à certains rôles. Utilisation :
 *   router.get("/admin-only", requireAuth, requireRole("admin"), handler)
 */
function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: "Accès refusé pour ce rôle." });
    }
    next();
  };
}

module.exports = { requireAuth, requireRole };
