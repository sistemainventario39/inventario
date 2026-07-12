import express from "express";
import crypto from "crypto";
import { db } from "../config/firebase.js";
import { FieldValue } from "firebase-admin/firestore";
import { Timestamp } from "firebase-admin/firestore";
import verificarToken from "../middleware/verificarToken.js";
import {
  normalize,
  badRequest,
  requireString,
} from "../utils/inventory.helpers.js";

import {
  normalizeLocationInput,
  normalizeComponent,
  normalizePeriferico,
  validatePayloadDuplicates,
  validateEquipoBody,
  serialIndexId,
  locationIdFromData,
} from "../utils/inventory.validators.js";

import {
  reserveIndex,
  releaseIndex,
  getOrCreateUbicacion,
  validateUniqueSerial,
} from "../utils/inventory.firestore.js";

import {
  COL,
  COMPONENTES_MAP,
  PERIFERICOS_MAP,
  EQUIPOS_MAP,
  TIPOS_PERMITIDOS,
} from "../utils/inventory.constants.js";

const Router = express.Router();

Router.post("/perifericos/:tipo", async (req, res) => {
  try {
    const tipoNorm = normalize(req.params.tipo);
    const tipoCorrecto = PERIFERICOS_MAP[tipoNorm];

    if (!tipoCorrecto) {
      return res.status(400).json({ message: "Tipo de periférico inválido." });
    }

    const { marca, modelo, serial, estado, notas, procedencia, asignacion } =
      req.body;

    if (!serial?.trim()) {
      return res.status(400).json({ message: "El serial es obligatorio." });
    }
    if (!modelo?.trim()) {
      return res.status(400).json({ message: "El modelo es obligatorio." });
    }
    if (!estado?.trim()) {
      return res.status(400).json({ message: "El estado es obligatorio." });
    }

    const serialStr = serial.trim();
    const serialNorm = normalize(serialStr);

    const resultId = await db.runTransaction(async (tx) => {
      // 1. Verificamos que el serial no exista en los INDICES generales
      const indexId = serialIndexId("periferico", serialStr);
      const indexRef = db.collection(COL.indices).doc(indexId);
      const indexSnap = await tx.get(indexRef);

      if (indexSnap.exists) {
        throw badRequest(
          `El serial "${serialStr}" ya se encuentra registrado en el sistema.`,
        );
      }

      // 2. Verificamos explícitamente en la colección por seguridad extra
      const existe = await tx.get(
        db
          .collection("perifericos")
          .where("serialNorm", "==", serialNorm)
          .limit(1),
      );

      if (!existe.empty) {
        throw badRequest(
          `El serial "${serialStr}" ya existe en la colección de periféricos.`,
        );
      }

      // 3. Reservamos el serial en los índices
      tx.set(indexRef, {
        prefix: "periferico",
        serial: serialStr,
        serialNorm: serialNorm,
        equipoId: null,
        equipoSerial: null,
        tipoEquipo: null,
        itemType: tipoCorrecto,
        createdAt: FieldValue.serverTimestamp(),
      });

      // 4. Creamos el documento en la colección periféricos
      const periRef = db.collection("perifericos").doc();

      const doc = {
        tipo: tipoCorrecto, // Guardará "Monitor", "Teclado", etc.
        marca: marca?.trim() || "Genérico",
        modelo: modelo.trim(),
        serial: serialStr,
        serialNorm: serialNorm,
        estado: estado.trim(),
        notas: notas?.trim() || null,
        procedencia: procedencia || null,
        asignacion: asignacion || null,
        asignado: false,
        equipoId: null,
        equipoSerial: null, // Agregado para hacer juego con la vista del frontend
        activo: true,
        fechaCreacion: FieldValue.serverTimestamp(),
        fechaActualizacion: FieldValue.serverTimestamp(),
      };

      tx.set(periRef, doc);

      return periRef.id;
    });

    return res.status(201).json({
      message: `${tipoCorrecto} registrado correctamente.`,
      id: resultId,
    });
  } catch (error) {
    console.error(error);
    return res.status(error.statusCode || 500).json({
      message: error.message || "Error interno del servidor.",
    });
  }
});

Router.get("/componentes", verificarToken, async (req, res) => {
  try {
    const { rol, sede } = req.user;

    if (rol !== "Superadministrador" && !sede) {
      return res.status(200).json([]);
    }

    const [equiposSnap, perifericosSnap] = await Promise.all([
      db.collection("equipos").get(),
      db.collection("perifericos").get(),
    ]);

    const resultado = [];

    const sedeUsuarioNormalizada = sede?.trim().toLowerCase();

    equiposSnap.forEach((doc) => {
      const data = doc.data();

      const sedeComponente =
        data.asignacion?.sede?.trim().toLowerCase() || null;
      const torreComponente = data.sede?.trim().toLowerCase() || null;

      if (
        rol === "Superadministrador" ||
        sedeComponente === sedeUsuarioNormalizada ||
        torreComponente === sedeUsuarioNormalizada
      ) {
        resultado.push({
          id: doc.id,
          tipo: data.tipo,
          marca: data.marca,
          modelo: data.modelo,
          serial: data.serial,
          estado: data.estado,

          region: data.asignacion?.region || null,
          estado_region: data.asignacion?.estado || null,
          ciudad: data.asignacion?.ciudad || null,
          sede: data.asignacion?.sede || data.sede || null,
          piso: data.asignacion?.piso || null,
          ala: data.asignacion?.ala || null,
        });
      }
    });

    // --- PROCESAR PERIFÉRICOS ---
    perifericosSnap.forEach((doc) => {
      const data = doc.data();

      const sedeComponente =
        data.asignacion?.sede?.trim().toLowerCase() || null;
      const torreComponente = data.sede?.trim().toLowerCase() || null;

      if (
        rol === "Superadministrador" ||
        sedeComponente === sedeUsuarioNormalizada ||
        torreComponente === sedeUsuarioNormalizada
      ) {
        resultado.push({
          id: doc.id,
          tipo: data.tipo,
          marca: data.marca,
          modelo: data.modelo,
          serial: data.serial,
          estado: data.estado,

          region: data.asignacion?.region || null,
          estado_region: data.asignacion?.estado || null,
          ciudad: data.asignacion?.ciudad || null,
          sede: data.asignacion?.sede || data.sede || null,
          piso: data.asignacion?.piso || null,
          ala: data.asignacion?.ala || null,
        });
      }
    });

    res.status(200).json(resultado);
  } catch (error) {
    res.status(500).json({
      message: "No se pudieron obtener los componentes.",
      error: error.message,
    });
  }
});

Router.get("/perifericos/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const periRef = db.collection("perifericos").doc(id);
    const periSnap = await periRef.get();

    if (!periSnap.exists) {
      return res.status(404).json({
        message: "El periférico solicitado no existe.",
      });
    }

    const periData = periSnap.data();
    let equipoRelacionado = null;

    // Buscamos si este periférico está asignado dentro del arreglo de alguna PC/Laptop
    const equiposSnap = await db.collection("equipos").get();

    for (const doc of equiposSnap.docs) {
      const equipo = doc.data();

      // Buscamos por serial normalizado o coincidencia exacta ignorando mayúsculas
      const encontrado = (equipo.perifericos || []).find(
        (p) =>
          p.serial?.toLowerCase().trim() ===
          periData.serial?.toLowerCase().trim(),
      );

      if (encontrado) {
        equipoRelacionado = {
          id: doc.id,
          tipo: equipo.tipo,
          serial: equipo.serial,
          marca: equipo.marca,
          modelo: equipo.modelo,
        };
        break; // Detener bucle al encontrar la asignación activa
      }
    }

    return res.status(200).json({
      id: periSnap.id,
      ...periData,
      equipoRelacionado, // Será null si no está asignado a ningún equipo
    });
  } catch (error) {
    console.error("Error al obtener el periférico:", error);
    return res
      .status(500)
      .json({ message: "Error interno al obtener el periférico." });
  }
});
const buildEquipoRelacionado = (id, equipoData) => ({
  id: id,
  tipo: equipoData.tipo,
  marca: equipoData.marca,
  modelo: equipoData.modelo,
  serial: equipoData.serial,
});
// Construir objeto equipoRelacionado sincronizado
Router.put("/perifericos/:tipo/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const {
      marca,
      modelo,
      serial,
      estado,
      notas,
      procedencia, // Se recibe pero se ignorará para proteger la data original
      ubicacion,
      asignadoA,
    } = req.body;

    const tipoNorm = normalize(req.params.tipo);
    const tipoCorrecto = TIPOS_PERMITIDOS[tipoNorm];
    if (!tipoCorrecto) throw badRequest("Tipo de periférico inválido.");

    const resultId = await db.runTransaction(async (tx) => {
      // --- FASE 1: LECTURAS ---
      const periRef = db.collection("perifericos").doc(id);
      const periSnap = await tx.get(periRef);
      if (!periSnap.exists) throw badRequest("Periférico no encontrado.");

      const current = periSnap.data();
      const targetSerial = serial || current.serial;
      const newSerialNorm = normalize(targetSerial);
      const isSerialChanged = newSerialNorm !== normalize(current.serial);

      // Índices
      const oldIndexRef = db
        .collection(COL.indices)
        .doc(serialIndexId("periferico", current.serial));
      let newIndexRef = null;
      if (isSerialChanged) {
        newIndexRef = db
          .collection(COL.indices)
          .doc(serialIndexId("periferico", targetSerial));
        const newIndexSnap = await tx.get(newIndexRef);
        if (newIndexSnap.exists)
          throw badRequest(`El serial "${targetSerial}" ya está en uso.`);
      }

      // --- Gestión de Equipos y Validación ---
      const oldEquipoId = current.equipoId;
      const newEquipoId =
        asignadoA === "" || asignadoA === "desvincular"
          ? null
          : asignadoA || oldEquipoId;
      const isTeamChanged = oldEquipoId !== newEquipoId;

      let oldEquipoRef = null,
        oldEquipoSnap = null;
      let newEquipoRef = null,
        newEquipoSnap = null;

      // 1. Cargar el equipo antiguo (si existe)
      if (oldEquipoId) {
        oldEquipoRef = db.collection(COL.equipos).doc(oldEquipoId);
        oldEquipoSnap = await tx.get(oldEquipoRef);
      }

      // 2. Cargar el equipo nuevo (si se asigna a uno)
      if (newEquipoId) {
        newEquipoRef = db.collection(COL.equipos).doc(newEquipoId);
        newEquipoSnap = await tx.get(newEquipoRef);
        if (!newEquipoSnap.exists)
          throw badRequest("El equipo seleccionado no existe.");

        const eqData = newEquipoSnap.data();
        if (!["PC", "Laptop"].includes(eqData.tipo)) {
          throw badRequest(`Destino inválido para tipo "${eqData.tipo}".`);
        }

        const yaTieneEsteTipo = (eqData.perifericos || []).some(
          (p) => p.tipo === tipoCorrecto && p.id !== id,
        );
        if (yaTieneEsteTipo)
          throw badRequest(`El equipo ya tiene un "${tipoCorrecto}" asignado.`);
      }

      // --- Construcción de datos ---
      const asigData = ubicacion
        ? normalizeLocationInput(
            {
              ...current.asignacion, // Datos existentes
              ...ubicacion, // Nuevos cambios (sobreescriben los viejos)
            },
            "asignacion",
          )
        : current.asignacion;

      // Datos del equipo para la relación
      let equipoRelacionado = null;
      if (newEquipoId && newEquipoSnap?.exists) {
        equipoRelacionado = buildEquipoRelacionado(
          newEquipoId,
          newEquipoSnap.data(),
        );
      }

      const updatedPerifericoData = {
        tipo: tipoCorrecto,
        marca: marca !== undefined ? marca : current.marca,
        modelo: modelo !== undefined ? modelo : current.modelo,
        serial: targetSerial,
        serialNorm: newSerialNorm,
        estado: estado !== undefined ? estado : current.estado,
        notas: notas !== undefined ? notas : current.notas,
        // PROYECTADO: Mantenemos procedencia original, NO se sobreescribe
        procedencia: current.procedencia,
        asignacion: asigData,
        asignado: !!newEquipoId,
        equipoId: newEquipoId,
        equipoSerial: newEquipoId
          ? newEquipoSnap?.data()?.serial || null
          : null,
        equipoRelacionado: equipoRelacionado,
        activo: current.activo,
      };

      // --- FASE 2: ESCRITURAS ---

      // 1. Manejo de Índices
      if (isSerialChanged) {
        tx.delete(oldIndexRef);
        tx.set(newIndexRef, { ...updatedPerifericoData, prefix: "periferico" });
      } else {
        tx.update(oldIndexRef, {
          ...updatedPerifericoData,
          prefix: "periferico",
        });
      }

      // 2. Sincronización de Arrays en Equipos
      if (isTeamChanged) {
        // A) Quitar del viejo
        if (oldEquipoSnap?.exists) {
          const oldData = oldEquipoSnap.data();
          tx.update(oldEquipoRef, {
            perifericos: (oldData.perifericos || []).filter((p) => p.id !== id),
            perifericosSerials: (oldData.perifericosSerials || []).filter(
              (s) => s !== current.serial,
            ),
            fechaActualizacion: FieldValue.serverTimestamp(),
          });
        }
        // B) Poner en el nuevo
        if (newEquipoSnap?.exists) {
          const newData = newEquipoSnap.data();
          tx.update(newEquipoRef, {
            perifericos: [
              ...(newData.perifericos || []).filter((p) => p.id !== id),
              { id, ...updatedPerifericoData },
            ],
            perifericosSerials: [
              ...(newData.perifericosSerials || []).filter(
                (s) => s !== targetSerial,
              ),
              targetSerial,
            ],
            fechaActualizacion: FieldValue.serverTimestamp(),
          });
        }
      } else if (newEquipoId && newEquipoSnap?.exists) {
        // C) Actualizar dentro del mismo equipo
        const newData = newEquipoSnap.data();
        tx.update(newEquipoRef, {
          perifericos: (newData.perifericos || []).map((p) =>
            p.id === id ? { id, ...updatedPerifericoData } : p,
          ),
          perifericosSerials: isSerialChanged
            ? [
                ...(newData.perifericosSerials || []).filter(
                  (s) => s !== current.serial,
                ),
                targetSerial,
              ]
            : newData.perifericosSerials,
          fechaActualizacion: FieldValue.serverTimestamp(),
        });
      }

      // 3. Actualización del documento del periférico
      tx.update(periRef, {
        ...updatedPerifericoData,
        fechaActualizacion: FieldValue.serverTimestamp(),
      });

      return id;
    });

    return res
      .status(200)
      .json({ message: "Operación realizada con éxito.", id: resultId });
  } catch (error) {
    console.error("Error en PUT /perifericos:", error);
    return res
      .status(error.statusCode || 500)
      .json({ message: error.message || "Error interno." });
  }
});

export default Router;
