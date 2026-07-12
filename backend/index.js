import "./config/env.js";
import express from "express";
import pool from "../frontend/config/bd.js";
import { env } from "../frontend/config/env.js";
import { getTransporter } from "../frontend/config/mailer.js";
import perifericos from "../frontend/apis/perifericos.js";
import ubicacion from "../frontend/apis/ubicacion.js";
import usuarios from "./apis/usuarios.js";
import equipos from "../frontend/apis/equipos.js";
import bitacora from "../frontend/apis/bitacora.js";
import exportacion from "./apis/exportacion.js";
import recuperarPassword from "../frontend/apis/recuperarPassword.js";
import estadisticas from "../frontend/apis/estadisticas.js";
import cors from "cors";
import cookieParser from "cookie-parser";

const PORT = 3001;
const app = express();
app.use(cookieParser());
app.use(
  cors({
    origin: true,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    exposedHeaders: ["Content-Disposition"],
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
app.use("/api", equipos);
app.use("/api", bitacora);
app.use("/api", exportacion);
app.use("/api", estadisticas);

const server = app.listen(PORT, () => {
  const smtpUser = env("SMTP_USER");
  const smtpOk = Boolean(smtpUser && env("SMTP_PASS") && getTransporter());
});
