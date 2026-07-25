const jwt = require("jsonwebtoken");
const env = require("../config/env");

/**
 * Vérifie le Bearer JWT et attache req.user = { id, email, role }.
 */
function authMiddleware(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Token manquant ou invalide" });
  }

  const token = header.slice(7);
  try {
    const payload = jwt.verify(token, env.jwtSecret);
    req.user = { id: payload.id, email: payload.email, role: payload.role };
    return next();
  } catch {
    return res.status(401).json({ message: "Token invalide ou expiré" });
  }
}

/**
 * Doit être utilisé APRÈS authMiddleware.
 * Autorise uniquement le rôle ADMIN.
 */
function adminMiddleware(req, res, next) {
  if (!req.user || req.user.role !== "ADMIN") {
    return res.status(403).json({ message: "Accès réservé aux administrateurs" });
  }
  return next();
}

/**
 * Auth optionnelle : si un token est présent et valide, remplit req.user.
 * Utile pour des routes publiques enrichies (ex: recommandations).
 */
function optionalAuth(req, _res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) return next();

  try {
    const payload = jwt.verify(header.slice(7), env.jwtSecret);
    req.user = { id: payload.id, email: payload.email, role: payload.role };
  } catch {
    // ignore invalid token on optional routes
  }
  return next();
}

module.exports = { authMiddleware, adminMiddleware, optionalAuth };
