import crypto from "crypto";

export const normalize = (value = "") =>
  String(value)
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

export const sha1 = (value) =>
  crypto.createHash("sha1").update(String(value)).digest("hex");

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
