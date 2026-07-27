function errorHandler(err, _req, res, _next) {
  console.error("[error]", err);

  if (err.code === "P2002") {
    return res.status(409).json({
      message: "Conflit : une ressource avec cette valeur unique existe déjà",
      fields: err.meta?.target,
    });
  }

  if (err.code === "P2025") {
    return res.status(404).json({ message: "Ressource introuvable" });
  }

  if (err.name === "MulterError") {
    return res.status(400).json({ message: err.message });
  }

  const status = err.status || err.statusCode || 500;
  return res.status(status).json({
    message: err.message || "Erreur serveur interne",
  });
}

module.exports = { errorHandler };
