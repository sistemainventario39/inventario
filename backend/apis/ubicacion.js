import express from "express";
import pool from "../config/bd.js";
import { db } from "../config/firebase.js";
import { FieldValue } from "firebase-admin/firestore";
import verificarToken from "../middleware/verificarToken.js";
import permitirEscritura from "../middleware/permitirEscritura.js";
import {
  normalizeLocationInput,
  locationIdFromData,
} from "../utils/inventory.validators.js";

const Router = express.Router();
const COL_UBICACIONES = "ubicaciones";

Router.get("/region", async (_req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT id_region, region AS nombre FROM region ORDER BY region ASC",
    );
    res.status(200).json(rows);
  } catch (e) {
    console.error("Error al obtener regiones:", e.message);
    res.status(500).json({ message: "Error al obtener regiones" });
  }
});

Router.get("/region/:id/estados", async (req, res) => {
  const { id } = req.params;
  if (!id) {
    return res.status(400).json({ message: "Región requerida" });
  }

  try {
    const [rows] = await pool.query(
      "SELECT id_estado, estado AS nombre FROM estados WHERE id_region = ? ORDER BY estado ASC",
      [id],
    );
    res.status(200).json(rows);
  } catch (e) {
    console.error("Error al obtener estados:", e.message);
    res.status(500).json({ message: "Error al obtener estados" });
  }
});

Router.get("/estados/:id/ciudades", async (req, res) => {
  const { id } = req.params;
  if (!id) {
    return res.status(400).json({ message: "Estado requerido" });
  }

  try {
    const [rows] = await pool.query(
      "SELECT id_ciudad, ciudad AS nombre FROM ciudades WHERE id_estado = ? ORDER BY ciudad ASC",
      [id],
    );
    res.status(200).json(rows);
  } catch (e) {
    console.error("Error al obtener ciudades:", e.message);
    res.status(500).json({ message: "Error al obtener ciudades" });
  }
});

Router.get("/ubicaciones", async (_req, res) => {
  try {
    const snap = await db.collection(COL_UBICACIONES).get();
    const unicasMap = new Map();

    snap.docs.forEach((doc) => {
      const ubi = { id: doc.id, ...doc.data() };
      const key = [
        ubi.region,
        ubi.estado,
        ubi.ciudad,
        ubi.sede,
        ubi.piso,
        ubi.ala || "",
      ].join("|");

      if (!unicasMap.has(key)) {
        unicasMap.set(key, ubi);
      }
    });

    const resultado = Array.from(unicasMap.values()).sort((a, b) =>
      `${a.sede}${a.piso}`.localeCompare(`${b.sede}${b.piso}`),
    );

    res.status(200).json(resultado);
  } catch (e) {
    console.error("Error al obtener ubicaciones:", e.message);
    res.status(500).json({ message: "Error al obtener ubicaciones" });
  }
});

Router.post(
  "/ubicaciones",
  verificarToken,
  permitirEscritura,
  async (req, res) => {
    try {
      const { region, estado, ciudad, sede, piso, ala } = req.body;

      const normUbicacion = normalizeLocationInput(
        { region, estado, ciudad, sede, piso, ala: ala || null },
        "ubicación",
      );

      const ubiId = locationIdFromData(normUbicacion);
      const ubiRef = db.collection(COL_UBICACIONES).doc(ubiId);
      const ubiSnap = await ubiRef.get();

      if (ubiSnap.exists) {
        return res.status(409).json({
          message: "Esta ubicación ya se encuentra registrada.",
        });
      }

      await ubiRef.set({
        ...normUbicacion,
        createdAt: FieldValue.serverTimestamp(),
      });

      res.status(201).json({
        message: "Ubicación registrada con éxito",
        id: ubiId,
        ...normUbicacion,
      });
    } catch (e) {
      const status = e.statusCode || 500;
      res.status(status).json({
        message: e.message || "Error al registrar la ubicación",
      });
    }
  },
);

Router.put(
  "/ubicaciones/:id",
  verificarToken,
  permitirEscritura,
  async (req, res) => {
    try {
      const { id } = req.params;
      const { region, estado, ciudad, sede, piso, ala } = req.body;

      const oldRef = db.collection(COL_UBICACIONES).doc(id);
      const oldSnap = await oldRef.get();

      if (!oldSnap.exists) {
        return res.status(404).json({ message: "Ubicación no encontrada." });
      }

      const normUbicacion = normalizeLocationInput(
        { region, estado, ciudad, sede, piso, ala: ala || null },
        "ubicación",
      );

      const newId = locationIdFromData(normUbicacion);

      if (id === newId) {
        await oldRef.update({
          ...normUbicacion,
          updatedAt: FieldValue.serverTimestamp(),
        });

        return res.status(200).json({
          message: "Ubicación actualizada con éxito",
          id: newId,
          ...normUbicacion,
        });
      }

      const newRef = db.collection(COL_UBICACIONES).doc(newId);
      const newSnap = await newRef.get();

      if (newSnap.exists) {
        return res.status(409).json({
          message: "Ya existe una ubicación con esos datos.",
        });
      }

      const oldData = oldSnap.data();

      await db.runTransaction(async (tx) => {
        tx.delete(oldRef);
        tx.set(newRef, {
          ...normUbicacion,
          createdAt: oldData.createdAt || FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp(),
        });
      });

      res.status(200).json({
        message: "Ubicación actualizada con éxito",
        id: newId,
        ...normUbicacion,
      });
    } catch (e) {
      const status = e.statusCode || 500;
      res.status(status).json({
        message: e.message || "Error al actualizar la ubicación",
      });
    }
  },
);

Router.delete(
  "/ubicaciones/:id",
  verificarToken,
  permitirEscritura,
  async (req, res) => {
    try {
      const { id } = req.params;
      const ubiRef = db.collection(COL_UBICACIONES).doc(id);
      const ubiSnap = await ubiRef.get();

      if (!ubiSnap.exists) {
        return res.status(404).json({ message: "Ubicación no encontrada." });
      }

      await ubiRef.delete();

      res.status(200).json({ message: "Ubicación eliminada con éxito" });
    } catch (e) {
      console.error("Error al eliminar ubicación:", e.message);
      res.status(500).json({ message: "Error al eliminar la ubicación" });
    }
  },
);

export default Router;
