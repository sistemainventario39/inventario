import "./config/env.js";
import express from "express";
import pool from "./config/bd.js";
import { env } from "./config/env.js";
import { getTransporter } from "./config/mailer.js";
import perifericos from "./apis/perifericos.js";
import ubicacion from "./apis/ubicacion.js";
import usuarios from "./apis/usuarios.js";
import recuperarPassword from "./apis/recuperarPassword.js";
import cors from "cors";

const PORT = 3001;
const app = express();
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);
app.use(express.json());

app.use((req, res, next) => {
  if (req.path.includes("recuperar") || req.path.includes("restablecer")) {
    console.log(
      `[${new Date().toLocaleTimeString()}] ${req.method} ${req.originalUrl}`,
      req.body?.email ? `email=${req.body.email}` : "",
    );
  }
  next();
});

app.use("/api", perifericos);
app.use("/api", ubicacion);
app.use("/api", usuarios);
app.use("/api", recuperarPassword);

const server = app.listen(PORT, () => {
  const smtpUser = env("SMTP_USER");
  const smtpOk = Boolean(smtpUser && env("SMTP_PASS") && getTransporter());
});

server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
  } else {
    console.error(err);
  }
  process.exit(1);
});
