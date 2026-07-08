import express from "express";
import { db } from "../config/firebase.js";
import verificarToken from "../middleware/verificarToken.js";

const Router = express.Router();

Router.get("/estadisticas", verificarToken, async (req, res) => {
  try {
    const user = req.user;
    const isSuperAdmin = user.rol === "Superadministrador";

    // Función auxiliar para construir la consulta según el rol
    const buildQuery = (collectionName) => {
      let query = db.collection(collectionName);

      if (!isSuperAdmin) {
        if (user.sede) query = query.where("asignacion.sede", "==", user.sede);
        if (user.piso) query = query.where("asignacion.piso", "==", user.piso);
        if (user.ala) query = query.where("asignacion.ala", "==", user.ala);
      }

      return query;
    };

    // Consultamos ambas colecciones en paralelo
    const [equiposSnap, perifericosSnap] = await Promise.all([
      buildQuery("equipos").get(),
      buildQuery("perifericos").get(),
    ]);

    const todosLosItems = [
      ...equiposSnap.docs.map((doc) => doc.data()),
      ...perifericosSnap.docs.map((doc) => doc.data()),
    ];

    // Variables para los 3 estados del sistema
    let bueno = 0;
    let danado = 0;
    let repuesto = 0;

    // Objeto para agrupar por categoría/tipo
    const hardwareMap = {};

    todosLosItems.forEach((item) => {
      let estadoRaw = item.estado || "Bueno";

      if (!item.estado && item.componentes && item.componentes.length > 0) {
        estadoRaw = item.componentes[0].estado || "Bueno";
      }

      estadoRaw = estadoRaw.toLowerCase();
      let statusGroup = "Bueno"; // Estado por defecto

      // Normalizamos cualquier variante a "Dañado" o "Repuesto"
      if (
        ["dañado", "danado", "falla", "reparación", "reparacion"].includes(
          estadoRaw,
        )
      ) {
        statusGroup = "Dañado";
        danado++;
      } else if (
        ["repuesto", "respuesto", "spare", "de repuesto"].includes(estadoRaw)
      ) {
        statusGroup = "Repuesto";
        repuesto++;
      } else {
        bueno++;
      }

      const tipo =
        item.tipo ||
        item.categoria ||
        (item.componentes ? "PCs/Equipos" : "Periféricos");

      if (!hardwareMap[tipo]) {
        hardwareMap[tipo] = { name: tipo, total: 0, disponibles: 0 };
      }

      hardwareMap[tipo].total++;
      // En la gráfica de barras, los "disponibles" serán los que estén en estado Bueno
      if (statusGroup === "Bueno") {
        hardwareMap[tipo].disponibles++;
      }
    });

    const hardwareData = Object.values(hardwareMap).sort(
      (a, b) => b.total - a.total,
    );

    // Datos estructurados para la gráfica de dona (3 secciones)
    const statusData = [
      { name: "Bueno", value: bueno },
      { name: "Dañado", value: danado },
      { name: "Repuesto", value: repuesto },
    ];

    return res.status(200).json({
      metrics: {
        total: todosLosItems.length,
        bueno,
        danado,
        repuesto,
      },
      hardwareData,
      statusData,
    });
  } catch (error) {
    console.error("Error al obtener estadísticas del dashboard:", error);
    return res
      .status(500)
      .json({ message: "Error al cargar el panel de control." });
  }
});

export default Router;
