import crypto from "crypto";

export const normalize = (value = "") =>
  String(value)
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

export const sha1 = (value) =>
  crypto.createHash("sha1").update(String(value)).digest("hex");

export const normalizeStatus = (value = "") => {
  const raw = String(value ?? "").trim();
  if (!raw) return "Bueno";

  const normalized = normalize(raw);

  if (
    ["bueno", "operativo", "funciona", "funcional", "disponible"].includes(
      normalized,
    )
  ) {
    return "Bueno";
  }

  if (
    [
      "danado",
      "dañado",
      "defectuoso",
      "falla",
      "fallado",
      "reparacion",
      "reparación",
      "inoperativo",
      "inoperable",
    ].includes(normalized)
  ) {
    return "Dañado";
  }

  if (["repuesto", "respuesto", "spare", "de repuesto"].includes(normalized)) {
    return "Repuesto";
  }

  return raw;
};

export function badRequest(message) {
  const err = new Error(message);
  err.statusCode = 400;
  return err;
}

export function requireString(value, field) {
  if (typeof value !== "string" || !value.trim()) {
    throw badRequest(`El campo "${field}" es obligatorio.`);
  }

  return value.trim();
}
