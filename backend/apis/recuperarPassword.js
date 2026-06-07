import express from "express";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import pool from "../config/bd.js";
import { env } from "../config/env.js";
import { sendPasswordResetEmail } from "../config/mailer.js";

const Router = express.Router();

const TOKEN_EXPIRY_MS = 15 * 60 * 1000;
const GENERIC_MESSAGE =
  "Enlace de recuperación enviado";

Router.post("/recuperar-password", async (req, res) => {
  console.log("[recuperar-password] Solicitud recibida");
  const { email } = req.body;

  if (!email || typeof email !== "string" || !email.trim()) {
    return res.status(400).json({ message: "El correo es obligatorio." });
  }

  const correo = email.trim().toLowerCase();

  try {
    const [rows] = await pool.execute(
      `
      SELECT u.id_usuario, p.correo
      FROM personas p
      INNER JOIN usuarios u ON p.id_usuario = u.id_usuario
      WHERE LOWER(p.correo) = ?
      LIMIT 1
      `,
      [correo],
    );

    if (rows.length === 0) {
      console.log("[recuperar-password] Correo no registrado:", correo);
    }

    if (rows.length > 0) {
      const { id_usuario } = rows[0];
      console.log("[recuperar-password] Usuario encontrado, id:", id_usuario);
      const resetToken = crypto.randomBytes(32).toString("hex");
      const tokenExpires = new Date(Date.now() + TOKEN_EXPIRY_MS);

      await pool.execute(
        `
        UPDATE usuarios
        SET reset_token = ?, token_expires = ?
        WHERE id_usuario = ?
        `,
        [resetToken, tokenExpires, id_usuario],
      );

      const frontendUrl = env("FRONTEND_URL") || "http://localhost:5173";
      const resetLink = `${frontendUrl}/nueva-password?token=${resetToken}`;

      try {
        await sendPasswordResetEmail(rows[0].correo, resetLink);
        console.log("[recuperar-password] Email enviado a:", rows[0].correo);
      } catch (mailError) {
        console.error("[recuperar-password] Error al enviar correo:", mailError.message);
        await pool.execute(
          `UPDATE usuarios SET reset_token = NULL, token_expires = NULL WHERE id_usuario = ?`,
          [id_usuario],
        );
        return res.status(500).json({
          message:
            "No se pudo enviar el correo. Verifica SMTP en .env e intenta de nuevo.",
        });
      }
    }

    res.status(200).json({ message: GENERIC_MESSAGE });
  } catch (e) {
    console.error("Error en recuperar-password:", e);
    res.status(500).json({
      message: "No se pudo procesar la solicitud. Intenta más tarde.",
    });
  }
});

Router.get("/validar-token", async (req, res) => {
  const { token } = req.query;

  if (!token || typeof token !== "string") {
    return res.status(400).json({ valid: false, message: "Token requerido." });
  }

  try {
    const [rows] = await pool.execute(
      `
      SELECT id_usuario, token_expires
      FROM usuarios
      WHERE reset_token = ?
      LIMIT 1
      `,
      [token],
    );

    if (rows.length === 0) {
      return res.status(400).json({
        valid: false,
        message: "Enlace inválido o expirado.",
      });
    }

    const expiresAt = new Date(rows[0].token_expires);
    if (Number.isNaN(expiresAt.getTime()) || expiresAt < new Date()) {
      return res.status(400).json({
        valid: false,
        message: "Enlace inválido o expirado.",
      });
    }

    res.status(200).json({ valid: true });
  } catch (e) {
    console.error("Error en validar-token:", e);
    res.status(500).json({
      valid: false,
      message: "Error al validar el enlace.",
    });
  }
});

Router.post("/restablecer-password", async (req, res) => {
  const { token, password } = req.body;

  if (!token || !password) {
    return res.status(400).json({
      message: "Token y contraseña son obligatorios.",
    });
  }

  if (typeof password !== "string" || password.length < 6) {
    return res.status(400).json({
      message: "La contraseña debe tener al menos 6 caracteres.",
    });
  }

  try {
    const [rows] = await pool.execute(
      `
      SELECT id_usuario, token_expires
      FROM usuarios
      WHERE reset_token = ?
      LIMIT 1
      `,
      [token],
    );

    if (rows.length === 0) {
      return res.status(400).json({
        message: "Enlace inválido o expirado.",
      });
    }

    const expiresAt = new Date(rows[0].token_expires);
    if (Number.isNaN(expiresAt.getTime()) || expiresAt < new Date()) {
      return res.status(400).json({
        message: "Enlace inválido o expirado.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await pool.execute(
      `
      UPDATE usuarios
      SET
        password = ?,
        reset_token = NULL,
        token_expires = NULL
      WHERE id_usuario = ?
      `,
      [hashedPassword, rows[0].id_usuario],
    );

    res.status(200).json({
      message: "Contraseña actualizada correctamente. Ya puedes iniciar sesión.",
    });
  } catch (e) {
    console.error("Error en restablecer-password:", e);
    res.status(500).json({
      message: "No se pudo actualizar la contraseña.",
    });
  }
});

export default Router;
