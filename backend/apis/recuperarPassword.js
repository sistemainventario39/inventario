import express from "express";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import db from "../config/firebase.js";
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
    const usuariosRef = db.collection("usuarios");
    const querySnapshot = await usuariosRef.where("correo", "==", correo).limit(1).get();

    if (querySnapshot.empty) {
      console.log("[recuperar-password] Correo no registrado:", correo);
      return res.status(200).json({ message: GENERIC_MESSAGE });
    }

    const userDoc = querySnapshot.docs[0];
    const id_usuario = userDoc.id;

    // Generar Token y fecha de expiración
    const resetToken = crypto.randomBytes(32).toString("hex");
    const tokenExpires = new Date(Date.now() + TOKEN_EXPIRY_MS);

    // Guardar el token en el documento del usuario en Firestore
    await usuariosRef.doc(id_usuario).update({
      reset_token: resetToken,
      token_expires: tokenExpires
    });

    const frontendUrl = env("FRONTEND_URL") || "http://localhost:5173";
    const resetLink = `${frontendUrl}/nueva-password?token=${resetToken}`;

    // Enviar el correo
    try {
      await sendPasswordResetEmail(correo, resetLink);
      console.log("[recuperar-password] Email enviado a:", correo);
    } catch (mailError) {
      console.error("[recuperar-password] Error al enviar correo:", mailError.message);
      // Revertir si falla el correo
      await usuariosRef.doc(id_usuario).update({
        reset_token: null,
        token_expires: null,
      });
      return res.status(500).json({
        message: "No se pudo enviar el correo. Verifica SMTP en .env e intenta de nuevo.",
      });
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
    const usuariosRef = db.collection("usuarios");
    const querySnapshot = await usuariosRef.where("reset_token", "==", token).limit(1).get();

    if (querySnapshot.empty) {
      return res.status(400).json({
        valid: false,
        message: "Enlace inválido o expirado.",
      });
    }

    const userData = querySnapshot.docs[0].data();
    const expiresAt = userData.token_expires ? userData.token_expires.toDate() : null; // Convertir a Date si es un Timestamp de Firestore

    if (!expiresAt || expiresAt < new Date()) {
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
    const usuariosRef = db.collection("usuarios");
    const querySnapshot = await usuariosRef.where("reset_token", "==", token).limit(1).get();

    if(querySnapshot.empty) {
      return res.status(400).json({
        message: "Enlace inválido o expirado.",
      });
    }

    const userDoc = querySnapshot.docs[0];
    const userData = userDoc.data();
    const expiresAt = userData.token_expires ? userData.token_expires.toDate() : null; // Convertir a Date si es un Timestamp de Firestore

    if (!expiresAt || expiresAt < new Date()) {
      return res.status(400).json({
        message: "Enlace inválido o expirado.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Actualizar la contraseña y limpiar los tokens en Firestore
    await usuariosRef.doc(userDoc.id).update({
      password: hashedPassword,
      reset_token: null,
      token_expires: null,
    });
    
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
