import "../config/env.js";
import pool from "../config/bd.js";
import { getTransporter } from "../config/mailer.js";
import { env } from "../config/env.js";

const API = "http://localhost:3001/api";

async function checkDatabase() {
  const [cols] = await pool.execute(
    `
    SELECT COLUMN_NAME
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'usuarios'
      AND COLUMN_NAME IN ('reset_token', 'token_expires')
    `,
    [env("DB_NAME")],
  );

  const names = cols.map((c) => c.COLUMN_NAME);
  const ok = names.includes("reset_token") && names.includes("token_expires");

  const [users] = await pool.execute(`SELECT p.correo FROM personas p LIMIT 3`);
  if (users.length > 0) {
    console.log(
      "  Correos de ejemplo en BD:",
      users.map((u) => u.correo).join(", "),
    );
  } else {
    console.log("  ⚠ No hay personas registradas para probar.");
  }

  return ok;
}

async function checkSmtp() {
  if (!env("SMTP_USER") || !env("SMTP_PASS")) {
    console.log("✗ SMTP: SMTP_USER o SMTP_PASS vacíos en .env");
    return false;
  }

  try {
    const transport = getTransporter();
    await transport.verify();
    console.log("✓ SMTP: conexión con Gmail correcta");
    return true;
  } catch (e) {
    console.log("✗ SMTP:", e.message);
    return false;
  }
}

async function checkApi(email) {
  try {
    const res = await fetch(`${API}/recuperar-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    console.log(
      res.ok
        ? `✓ API recuperar-password (${res.status}): ${data.message}`
        : `✗ API recuperar-password (${res.status}): ${data.message}`,
    );

    const [rows] = await pool.execute(
      `SELECT reset_token IS NOT NULL AS tiene_token, token_expires
       FROM usuarios u
       INNER JOIN personas p ON p.id_usuario = u.id_usuario
       WHERE LOWER(p.correo) = ?
       LIMIT 1`,
      [email.trim().toLowerCase()],
    );

    if (rows.length && rows[0].tiene_token) {
      console.log("✓ Token guardado en BD, expira:", rows[0].token_expires);
      return rows[0];
    }
    if (rows.length) {
      console.log(
        "  (Correo existe pero no se generó token — revisa logs del servidor)",
      );
    }
    return null;
  } catch (e) {
    console.log("✗ API: ¿Está el backend corriendo en puerto 3001?", e.message);
    return null;
  }
}

async function main() {
  const testEmail = process.argv[2];

  console.log("\n--- Verificación recuperación de contraseña ---\n");

  const dbOk = await checkDatabase();
  const smtpOk = await checkSmtp();

  if (!testEmail) {
    console.log("\nPara probar el endpoint, ejecuta:");
    console.log(
      "  node scripts/verificar-recuperacion.js correo@ejemplo.com\n",
    );
    await pool.end();
    process.exit(dbOk && smtpOk ? 0 : 1);
  }

  console.log(`\n--- Probando con: ${testEmail} ---\n`);
  await checkApi(testEmail);

  console.log("\nRevisa la bandeja de entrada (y spam) del correo indicado.\n");
  await pool.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
