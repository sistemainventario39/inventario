import express from "express";
import pool from "../config/bd.js";
//import verificarToken from "../Middleware/autenticación.js";

const Router = express.Router();

Router.get("/region", async (req, res) => {
  try {
    const query = `SELECT id_region, region FROM region ORDER BY region`;
    const [rows] = await pool.execute(query);
    res.status(200).json(rows);
  } catch (e) {
    res.status(500).json({ message: "Error interno" });
  }
});

Router.get("/region/:id/estados", async (req, res) => {
  const id = req.params.id;
  try {
    const query = `SELECT id_estado, estados FROM estados WHERE id_region = ? ORDER BY estados`;
    const [rows] = await pool.execute(query, [id]);
    res.status(200).json(rows);
  } catch (e) {
    console.error("Lol. Error obteniendo estados:", e);
    res.status(500).json({ message: "Error interno" });
  }
});

Router.get("/estados/:id/ciudades", async (req, res) => {
  const id = req.params.id;
  try {
    const query = `SELECT id_ciudad, ciudad FROM ciudades WHERE id_estado = ? ORDER BY ciudad`;
    const [rows] = await pool.execute(query, [id]);
    res.status(200).json(rows);
  } catch (e) {
    console.error("Lol. Error obteniendo ciudades:", e);
    res.status(500).json({ message: "Error interno" });
  }
});

//api para traer las ciudades sin necesidad de tener el id del estado

Router.get("/ciudades", async (req, res) => {
  try {
    const query = `SELECT id_ciudad, ciudad FROM ciudades WHERE capital = 1 ORDER BY ciudad`;
    const [rows] = await pool.execute(query);
    res.status(200).json(rows);
  } catch (e) {
    console.error("Lol. No se obtuvo nada", e);
    res.status(500).json({ message: "Error interno" });
  }
});

Router.get("/ciudades/:id/sede", async (req, res) => {
  const id = req.params.id;
  try {
    const query = `SELECT id_sede, sede FROM sede WHERE id_ciudad = ? ORDER BY sede`;
    const [rows] = await pool.execute(query, [id]);
    res.status(200).json(rows);
  } catch (e) {
    console.error("Lol. Error obteniendo a la sede:", e);
    res.status(500).json({ message: "Error interno" });
  }
});

Router.get("/sede/:id/piso", async (req, res) => {
  const id = req.params.id;
  try {
    const query = `SELECT id_piso, piso FROM piso WHERE id_sede = ? ORDER BY piso`;
    const [rows] = await pool.execute(query, [id]);
    res.status(200).json(rows);
  } catch (e) {
    console.error("Lol. Error obteniendo a piso 21:", e);
    res.status(500).json({ message: "Error interno" });
  }
});

Router.get("/ala", async (req, res) => {
  try {
    const query = `SELECT id_ala, ala FROM alas ORDER BY ala`;
    const [rows] = await pool.execute(query);
    res.status(200).json(rows);
  } catch (e) {
    res.status(500).json({ message: "Error interno" });
  }
});

Router.get("/ubicaciones", async (req, res) => {
  try {
    const query = `
      SELECT 
        r.id_region,
        r.region,
        e.id_estado,
        e.estado,
        c.id_ciudad,
        c.ciudad,
        s.id_sede,
        s.sede,
        p.id_piso,
        p.piso,
        p.alas
      FROM sede s
      INNER JOIN ciudades c ON s.id_ciudad = c.id_ciudad
      INNER JOIN estados e ON c.id_estado = e.id_estado
      INNER JOIN region r ON e.id_region = r.id_region
      LEFT JOIN piso p ON p.id_sede = s.id_sede
      ORDER BY s.sede, p.piso;
    `;

    const [rows] = await pool.execute(query);
    res.status(200).json(rows);
  } catch (e) {
    console.error("Error al obtener el maestro de ubicaciones:", e);
    res.status(500).json({ message: "Error interno del servidor" });
  }
});

export default Router;
