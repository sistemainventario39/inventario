export default function esSuperAdmin(req, res, next) {
  if (req.user.rol !== "Superadministrador") {
    return res
      .status(403)
      .json({ message: "Acceso denegado. Requiere ser Superadministrador." });
  }
  next();
}
