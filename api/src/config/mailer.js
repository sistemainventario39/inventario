import nodemailer from "nodemailer";
import { env } from "./env.js";

function createTransporter() {
  const user = env("SMTP_USER");
  const pass = env("SMTP_PASS");

  if (!user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass },
  });
}

let transporter = null;

export function getTransporter() {
  if (!transporter) {
    transporter = createTransporter();
  }
  return transporter;
}

export async function sendPasswordResetEmail(to, resetLink) {
  const transport = getTransporter();

  if (!transport) {
    throw new Error(
      "SMTP no configurado: revisa SMTP_USER y SMTP_PASS en backend/.env",
    );
  }

  const info = await transport.sendMail({
    from: `"CANTV Inventario" <${env("SMTP_USER")}>`,
    to,
    subject: "Recuperación de contraseña",
    html: `
      <p>Hola,</p>
      <p>Recibimos una solicitud para restablecer tu contraseña.</p>
      <p><a href="${resetLink}">Haz clic aquí para crear una nueva contraseña</a></p>
      <p>Este enlace expira en <strong>15 minutos</strong>. Si no solicitaste este cambio, ignora este correo.</p>
    `,
    text: `Restablece tu contraseña (válido 15 min): ${resetLink}`,
  });

  console.log("[mailer] Correo enviado:", info.messageId, "→", to);
  return info;
}
