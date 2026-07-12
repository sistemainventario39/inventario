import mysql from "mysql2/promise";
import { env } from "./env.js";

const pool = mysql.createPool({
  host: env("DB_HOST"),
  user: env("DB_USER"),
  password: env("DB_PASSWORD"),
  database: env("DB_NAME"),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

pool
  .getConnection()
  .then((connection) => {
    console.log("Existe conexión");
    connection.release();
  })
  .catch((err) => {
    console.error("Error al conectar a MySQL:", err);
  });

export default pool;
