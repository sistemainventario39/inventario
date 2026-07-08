import express from "express";
import crypto from "crypto";
import { db } from "../config/firebase.js";
import { FieldValue } from "firebase-admin/firestore";
import verificarToken from "../middleware/verificarToken.js";
import permitirEscritura from "../middleware/permitirEscritura.js";
import { generarCambiosEquipo } from "../controller/generarCambios.js";
import {
  normalize,
  badRequest,
  requireString,
  normalizeStatus,
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
} from "../utils/inventory.constants.js";

const Router = express.Router();

function buildEquipoDoc(
  tipoEquipo,
  body,
  procedencia,
  asignacion,
  componentes,
  perifericos,
) {
  return {
    tipo: tipoEquipo,
    marca: body.marca.trim(),
    modelo: body.modelo.trim(),
    serial: body.serial.trim(),
    serialNorm: normalize(body.serial),
    estado: normalizeStatus(body.estado),
    notas: body.notas || null,
    fechaRegistro: new Date().toISOString(),
    procedencia,
    asignacion,
    componentes,
    perifericos,
    componentesSerials: componentes.map((c) => normalize(c.serial)),
    perifericosSerials: perifericos.map((p) => normalize(p.serial)),
    estadoActivo: true,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  };
}

async function registrarEquipo(tipoRaw, req, res) {
  try {
    // Capturamos el usuario autenticado (inyectado por verificarToken)
    const usuarioActivo = req.user;

    const tipoNorm = normalize(tipoRaw);
    const tipoEquipo = EQUIPOS_MAP[tipoNorm];

    if (!tipoEquipo) {
      return res.status(400).json({ message: "Tipo de equipo inválido." });
    }

    const body = validateEquipoBody(req.body);
    validatePayloadDuplicates(body.componentes, body.perifericos);

    const equipoRef = db.collection(COL.equipos).doc();

    const resultId = await db.runTransaction(async (tx) => {
      // --- FASE 1: LECTURAS (tx.get) ---
      await validateUniqueSerial(tx, body.serial, "equipo");

      const procData = normalizeLocationInput(body.procedencia, "procedencia");
      const asigData = normalizeLocationInput(body.asignacion, "asignacion");
      const procRef = db
        .collection(COL.ubicaciones)
        .doc(locationIdFromData(procData));
      const asigRef = db
        .collection(COL.ubicaciones)
        .doc(locationIdFromData(asigData));

      const snapProc = await tx.get(procRef);
      const snapAsig = await tx.get(asigRef);

      const normalizedComponentes = [];
      for (let i = 0; i < body.componentes.length; i++) {
        const comp = normalizeComponent(body.componentes[i], i);
        await validateUniqueSerial(tx, comp.serial, "componente");
        normalizedComponentes.push(comp);
      }

      const normalizedPerifericos = [];
      const perifericosExistentes = [];

      for (let i = 0; i < body.perifericos.length; i++) {
        const peri = normalizePeriferico(body.perifericos[i], i);
        const periSerialNorm = normalize(peri.serial);

        const periQuery = await tx.get(
          db
            .collection("perifericos")
            .where("serialNorm", "==", periSerialNorm)
            .limit(1),
        );

        if (!periQuery.empty) {
          const periDoc = periQuery.docs[0];
          if (periDoc.data().asignado) {
            throw badRequest(
              `El periférico con serial "${peri.serial}" ya está asignado a otro equipo.`,
            );
          }
          perifericosExistentes.push({
            ref: periDoc.ref,
            data: periDoc.data(),
          });
        } else {
          perifericosExistentes.push(null);
        }

        await validateUniqueSerial(tx, peri.serial, "periferico");
        normalizedPerifericos.push(peri);
      }

      // --- [NUEVO] CONSTRUCCIÓN DE DETALLES PARA LA BITÁCORA ---
      // Filtramos dinámicamente los componentes según su tipo (asumiendo que comp.tipo contiene 'ram', 'procesador' o 'disco')
      const rams = normalizedComponentes.filter((c) =>
        c.tipo?.toLowerCase().includes("ram"),
      );
      const cpus = normalizedComponentes.filter(
        (c) =>
          c.tipo?.toLowerCase().includes("procesador") ||
          c.tipo?.toLowerCase() === "cpu",
      );
      const discos = normalizedComponentes.filter(
        (c) =>
          c.tipo?.toLowerCase().includes("disco") ||
          c.tipo?.toLowerCase().includes("almacenamiento"),
      );

      // Armamos los segmentos de texto extrayendo la capacidad o modelo
      const txtRam =
        rams.length > 0
          ? rams.map((r) => r.capacidad || "RAM").join(" + ")
          : "sin especificar RAM";
      const txtCpu =
        cpus.length > 0
          ? cpus.map((c) => c.modelo || "Procesador").join(" / ")
          : "sin especificar procesador";
      const txtDisco =
        discos.length > 0
          ? discos.map((d) => d.capacidad || "Disco Duro").join(" + ")
          : "sin especificar almacenamiento";

      // Armamos la sección de periféricos
      let txtPerifericos = "sin periféricos adicionales";
      if (normalizedPerifericos.length > 0) {
        txtPerifericos = normalizedPerifericos
          .map((p) => `${p.tipo} (${p.marca || ""} - S/N: ${p.serial})`)
          .join(", ");
      }

      // Mensaje final estructurado tal como lo pediste
      const mensajeBitacora = `Se registró ${tipoEquipo} (Serial: ${body.serial}) con ${txtRam} RAM, procesador ${txtCpu}, ${txtDisco} de disco duro, y periféricos: ${txtPerifericos}.`;

      // --- FASE 2: ESCRITURAS (tx.set / tx.update) ---
      if (!snapProc.exists) {
        tx.set(
          procRef,
          { ...procData, createdAt: FieldValue.serverTimestamp() },
          { merge: true },
        );
      }
      if (!snapAsig.exists) {
        tx.set(
          asigRef,
          { ...asigData, createdAt: FieldValue.serverTimestamp() },
          { merge: true },
        );
      }

      // Guardar componentes en índices
      for (const comp of normalizedComponentes) {
        const idxId = serialIndexId("componente", comp.serial);
        tx.set(db.collection(COL.indices).doc(idxId), {
          prefix: "componente",
          serial: comp.serial,
          serialNorm: normalize(comp.serial),
          equipoId: equipoRef.id,
          equipoSerial: body.serial,
          tipoEquipo,
          itemType: comp.tipo,
          createdAt: FieldValue.serverTimestamp(),
        });
      }

      // Guardar periféricos en índices Y en la colección "perifericos"
      for (let i = 0; i < normalizedPerifericos.length; i++) {
        const peri = normalizedPerifericos[i];
        const existente = perifericosExistentes[i];
        const idxId = serialIndexId("periferico", peri.serial);

        tx.set(db.collection(COL.indices).doc(idxId), {
          prefix: "periferico",
          serial: peri.serial,
          serialNorm: normalize(peri.serial),
          equipoId: equipoRef.id,
          equipoSerial: body.serial,
          tipoEquipo,
          itemType: peri.tipo,
          createdAt: FieldValue.serverTimestamp(),
        });

        if (existente) {
          tx.update(existente.ref, {
            asignado: true,
            equipoId: equipoRef.id,
            equipoSerial: body.serial,
            fechaActualizacion: FieldValue.serverTimestamp(),
          });
        } else {
          const newPeriRef = db.collection("perifericos").doc();
          tx.set(newPeriRef, {
            tipo: peri.tipo,
            marca: peri.marca,
            modelo: peri.modelo,
            serial: peri.serial,
            serialNorm: normalize(peri.serial),
            estado: peri.estado,
            notes: peri.notas || "",
            procedencia: procData,
            asignacion: asigData,
            asignado: true,
            equipoId: equipoRef.id,
            equipoSerial: body.serial,
            activo: true,
            fechaCreacion: FieldValue.serverTimestamp(),
            fechaActualizacion: FieldValue.serverTimestamp(),
          });
        }
      }

      const teamIndexId = serialIndexId("equipo", body.serial);
      tx.set(db.collection(COL.indices).doc(teamIndexId), {
        prefix: "equipo",
        serial: body.serial,
        serialNorm: normalize(body.serial),
        equipoId: equipoRef.id,
        equipoSerial: body.serial,
        tipoEquipo,
        createdAt: FieldValue.serverTimestamp(),
      });

      tx.set(
        equipoRef,
        buildEquipoDoc(
          tipoEquipo,
          body,
          procData,
          asigData,
          normalizedComponentes,
          normalizedPerifericos,
        ),
      );

      // --- [NUEVO] ESCRITURA EN LA COLECCIÓN BITÁCORA ---
      const bitacoraRef = db.collection("bitacora").doc();
      tx.set(bitacoraRef, {
        usuario: usuarioActivo?.username || "Usuario Anónimo",
        id_modificado: equipoRef.id,
        accion: `Registro de ${tipoEquipo}`,
        detalles: [mensajeBitacora],
        fecha: FieldValue.serverTimestamp(),
        sede: asigData.sede || "N/A",
      });

      return equipoRef.id;
    });

    return res.status(201).json({
      message: `${tipoEquipo.toUpperCase()} registrada con éxito.`,
      id: resultId,
    });
  } catch (error) {
    console.error("Error registrando equipo:", error);
    return res
      .status(error.statusCode || 500)
      .json({ message: error.message || "Error interno" });
  }
}

// Integramos el middleware verificarToken para rescatar req.user con seguridad
Router.post("/pc", verificarToken, async (req, res) =>
  registrarEquipo("pc", req, res),
);
Router.post("/laptop", verificarToken, async (req, res) =>
  registrarEquipo("laptop", req, res),
);

Router.get("/equipos", verificarToken, async (req, res) => {
  try {
    const { tipo, estado, serial } = req.query;
    const snap = await db.collection(COL.equipos).get();

    let rows = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    if (rol !== "Superadministrador") {
      rows = rows.filter(
        (r) => r.torre === torre || r.asignacion?.sede === torre,
      );
    }

    if (tipo) {
      const tipoNorm = normalize(tipo);
      rows = rows.filter((r) => normalize(r.tipo) === tipoNorm);
    }

    if (estado) {
      const estadoNorm = normalize(estado);
      rows = rows.filter((r) => normalize(r.estado) === estadoNorm);
    }

    if (serial) {
      const serialNorm = normalize(serial);
      rows = rows.filter((r) => normalize(r.serial) === serialNorm);
    }

    res.status(200).json(rows);
  } catch (error) {
    res.status(500).json({
      message: "No se pudieron obtener los equipos.",
      error: error.message,
    });
  }
});

Router.get("/equipos/lista", async (req, res) => {
  const snap = await db.collection("equipos").get();

  const equipos = snap.docs.map((doc) => {
    const d = doc.data();

    return {
      id: doc.id,
      serial: d.serial,
      marca: d.marca,
      modelo: d.modelo,
      tipo: d.tipo,
    };
  });

  res.json(equipos);
});

Router.get("/equipos/:id", async (req, res) => {
  try {
    const snap = await db.collection(COL.equipos).doc(req.params.id).get();

    if (!snap.exists) {
      return res.status(404).json({ message: "Equipo no encontrado." });
    }

    return res.status(200).json({ id: snap.id, ...snap.data() });
  } catch (error) {
    return res.status(500).json({
      message: "Error al obtener el equipo.",
      error: error.message,
    });
  }
});
//Realiza la normalización
const formatTipo = (tipo) => {
  if (!tipo) return tipo;
  const t = String(tipo).toLowerCase();
  if (t.includes("ram") || t.includes("memoria")) return "Memoria_RAM";
  if (t.includes("disco") || t.includes("hdd") || t.includes("ssd"))
    return "Disco_Duro";
  if (t.includes("procesador") || t.includes("cpu")) return "Procesador";

  return tipo; // Si no coincide, devuelve el original
};
// Validar arreglos del payload antes de iniciar la transacción
const validateInventoryArrays = (arr, name) => {
  if (!arr) return [];
  if (!Array.isArray(arr)) throw badRequest(`${name} debe ser un arreglo.`);

  // Función auxiliar de normalización
  const formatTipo = (tipo) => {
    if (!tipo) return tipo;
    const t = String(tipo).toLowerCase();

    if (t.includes("ram") || t.includes("memoria")) return "Memoria_RAM";
    if (t.includes("disco") || t.includes("hdd") || t.includes("ssd"))
      return "Disco_Duro";
    if (t.includes("procesador") || t.includes("cpu")) return "Procesador";

    return tipo; // Retorna el original si no coincide con los patrones
  };

  const serials = [];
  const ids = [];

  // Procesamos el array: validamos y normalizamos en un solo paso
  const processedArr = arr.map((item) => {
    if (!item) throw badRequest(`${name} contiene elementos nulos.`);

    // Validación de serial
    if (!item.serial || String(item.serial).trim() === "") {
      throw badRequest(`Existen elementos con seriales vacíos en ${name}.`);
    }

    // Clonamos el objeto para no mutar el original y aplicamos normalización si es componente
    const newItem = { ...item };
    if (name === "componentes") {
      newItem.tipo = formatTipo(newItem.tipo);
    }

    // Acumulamos seriales e ids para la validación de duplicados
    serials.push(newItem.serial);
    if (newItem.id) ids.push(newItem.id);

    return newItem;
  });

  // Validamos duplicados usando los seriales recolectados
  if (new Set(serials).size !== serials.length) {
    throw badRequest(
      `Existen seriales duplicados en ${name} dentro del formulario.`,
    );
  }

  return processedArr; // Retornamos el array ya normalizado y validado
};
const buildEquipoRelacionado = (id, equipoData) => ({
  id: id,
  tipo: equipoData.tipo,
  marca: equipoData.marca,
  modelo: equipoData.modelo,
  serial: equipoData.serial,
});
Router.put(
  "/equipos/:id",
  verificarToken,
  permitirEscritura,
  async (req, res) => {
    try {
      const usuarioActivo = req.user; // Captura segura del usuario en sesión
      const equipoId = req.params.id;
      const body = req.body;

      // 1. Validaciones tempranas
      const validComponentes = validateInventoryArrays(
        body.componentes,
        "componentes",
      );
      const validPerifericos = validateInventoryArrays(
        body.perifericos,
        "perifericos",
      );

      const result = await db.runTransaction(async (tx) => {
        // --- FASE 1: LECTURAS ---
        const equipoRef = db.collection(COL.equipos).doc(equipoId);
        const equipoSnap = await tx.get(equipoRef);
        if (!equipoSnap.exists) throw badRequest("Equipo no encontrado.");
        const current = equipoSnap.data();

        const newSerialNorm = normalize(body.serial || current.serial);

        // Lógica de ubicación
        const hasNewLocation =
          body.ubicacion || body.region || body.estado_ubicacion;
        let asigData = current.asignacion;
        if (hasNewLocation) {
          const rawAsignacion = {
            region: body.region || body.ubicacion?.region,
            estado: body.estado_ubicacion || body.ubicacion?.estado,
            ciudad: body.ciudad || body.ubicacion?.ciudad,
            sede: body.sede || body.ubicacion?.sede,
            piso: body.piso || body.ubicacion?.piso,
            alas:
              body.alas ||
              body.ala ||
              body.ubicacion?.alas ||
              body.ubicacion?.ala,
          };
          asigData = normalizeLocationInput(rawAsignacion, "asignacion");
        }

        // --- Procesamiento de Periféricos ---
        const oldPerifericos = current.perifericos || [];
        const getNormSerial = (p) => (p.serial ? normalize(p.serial) : null);
        const oldPerifSerials = oldPerifericos
          .map(getNormSerial)
          .filter(Boolean);
        const newPerifSerials = validPerifericos
          .map(getNormSerial)
          .filter(Boolean);

        const addedSerials = newPerifSerials.filter(
          (s) => !oldPerifSerials.includes(s),
        );
        const removedSerials = oldPerifSerials.filter(
          (s) => !newPerifSerials.includes(s),
        );
        const keptSerials = oldPerifSerials.filter((s) =>
          newPerifSerials.includes(s),
        );

        const perifericosActionMap = { remove: [], add: [], keep: [] };

        for (const sNorm of removedSerials) {
          const oldP = oldPerifericos.find((p) => getNormSerial(p) === sNorm);
          if (oldP?.id) {
            perifericosActionMap.remove.push({
              id: oldP.id,
              serial: oldP.serial,
              tipo: oldP.tipo,
            });
          }
        }

        for (const sNorm of addedSerials) {
          const rawInput = validPerifericos.find(
            (p) => getNormSerial(p) === sNorm,
          );
          const inputData = normalizePeriferico(
            rawInput,
            validPerifericos.indexOf(rawInput),
          );
          const periQuery = await tx.get(
            db
              .collection("perifericos")
              .where("serialNorm", "==", sNorm)
              .limit(1),
          );

          if (!periQuery.empty) {
            const doc = periQuery.docs[0];
            const data = doc.data();
            if (data.asignado && data.equipoId !== equipoId) {
              throw badRequest(
                `El periférico "${inputData.serial}" ya está asignado a otro equipo.`,
              );
            }
            perifericosActionMap.add.push({
              isNew: false,
              id: doc.id,
              data: data,
              inputData,
            });
          } else {
            perifericosActionMap.add.push({
              isNew: true,
              id: db.collection("perifericos").doc().id,
              inputData,
            });
          }
        }

        for (const sNorm of keptSerials) {
          const oldP = oldPerifericos.find((p) => getNormSerial(p) === sNorm);
          if (oldP?.id)
            perifericosActionMap.keep.push({ id: oldP.id, data: oldP });
        }

        // --- FASE 2: ESCRITURAS ---
        const equipoRelacionadoSync = buildEquipoRelacionado(equipoId, {
          tipo: body.tipo || current.tipo,
          marca: body.marca || current.marca,
          modelo: body.modelo || current.modelo,
          serial: body.serial || current.serial,
        });
        const finalPerifericosArray = [];

        // Ejecutar Remociones de Periféricos
        for (const item of perifericosActionMap.remove) {
          const ref = db.collection("perifericos").doc(item.id);

          tx.update(ref, {
            asignado: false,
            equipoId: null,
            equipoSerial: null,
            equipoRelacionado: null,
          });

          tx.update(
            db
              .collection(COL.indices)
              .doc(serialIndexId("periferico", item.serial)),
            {
              equipoId: null,
              equipoSerial: null,
              tipoEquipo: null,
            },
          );
        }
        // Ejecutar Adiciones de Periféricos
        for (const item of perifericosActionMap.add) {
          const ref = db.collection("perifericos").doc(item.id);
          const syncRel = {
            asignado: true,
            equipoId: equipoId,
            equipoSerial: equipoRelacionadoSync.serial,
            equipoRelacionado: equipoRelacionadoSync,
          };
          if (item.isNew) {
            tx.set(ref, {
              ...item.inputData,
              serialNorm: normalize(item.inputData.serial),
              asignacion: asigData,
              ...syncRel,
            });
          } else {
            const snap = await tx.get(ref);
            if (snap.exists) tx.update(ref, syncRel);
          }
          tx.set(
            db
              .collection(COL.indices)
              .doc(serialIndexId("periferico", item.inputData.serial)),
            {
              prefix: "periferico",
              serial: item.inputData.serial,
              ...syncRel,
              tipoEquipo: equipoRelacionadoSync.tipo,
            },
            { merge: true },
          );
          finalPerifericosArray.push({
            id: item.id,
            ...(item.isNew ? item.inputData : item.data),
            ...syncRel,
          });
        }

        // Mantener Periféricos existentes
        for (const item of perifericosActionMap.keep) {
          const ref = db.collection("perifericos").doc(item.id);
          tx.update(ref, {
            equipoSerial: equipoRelacionadoSync.serial,
            equipoRelacionado: equipoRelacionadoSync,
          });
          finalPerifericosArray.push({
            id: item.id,
            ...item.data,
            equipoId,
            equipoSerial: equipoRelacionadoSync.serial,
            equipoRelacionado: equipoRelacionadoSync,
          });
        }

        // --- FUSIÓN DE COMPONENTES ---
        const currentComponentes = current.componentes || [];
        const componentsMap = new Map();
        currentComponentes.forEach((c) => componentsMap.set(c.serial, c));

        const finalComponentes = validComponentes.map((nuevoComp) => {
          const antiguo = componentsMap.get(nuevoComp.serial);
          if (antiguo) return { ...antiguo, ...nuevoComp };
          return nuevoComp;
        });

        // --- [NUEVO] CALCULAR LISTA DE CAMBIOS PARA LA BITÁCORA ---
        const nombresPerifAnadidos = perifericosActionMap.add.map(
          (p) => `${p.inputData.tipo} (S/N: ${p.inputData.serial})`,
        );
        const nombresPerifRemovidos = perifericosActionMap.remove.map(
          (p) => `${p.tipo} (S/N: ${p.serial})`,
        );

        const listaCambios = generarCambiosEquipo(current, {
          tipo: equipoRelacionadoSync.tipo,
          marca: equipoRelacionadoSync.marca,
          modelo: equipoRelacionadoSync.modelo,
          serial: equipoRelacionadoSync.serial,
          estado: normalizeStatus(body.estado),
          asignacion: asigData,
          componentes: finalComponentes,
          perifericosAnadidos: nombresPerifAnadidos,
          perifericosRemovidos: nombresPerifRemovidos,
        });

        // 4. Actualizar Equipo Principal
        tx.update(equipoRef, {
          tipo: equipoRelacionadoSync.tipo,
          marca: equipoRelacionadoSync.marca,
          modelo: equipoRelacionadoSync.modelo,
          serial: equipoRelacionadoSync.serial,
          serialNorm: newSerialNorm,
          estado: normalizeStatus(body.estado || current.estado),
          asignacion: asigData,
          componentes: finalComponentes,
          perifericos: finalPerifericosArray,
          fechaActualizacion: FieldValue.serverTimestamp(),
        });

        // --- [NUEVO] GUARDAR EN BITÁCORA SOLO SI SE DETECTARON CAMBIOS ---
        if (listaCambios.length > 0) {
          const bitacoraRef = db.collection("bitacora").doc();
          tx.set(bitacoraRef, {
            usuario: usuarioActivo?.username || "Usuario Anónimo",
            id_modificado: equipoId,
            accion: `Actualización de ${equipoRelacionadoSync.tipo}`,
            detalles: listaCambios,
            fecha: FieldValue.serverTimestamp(),
            sede: asigData?.sede || current.asignacion?.sede || "N/A",
          });
        }

        return equipoId;
      });

      return res
        .status(200)
        .json({ message: "Equipo actualizado correctamente.", id: result });
    } catch (error) {
      console.error("Error en PUT /equipos/:id:", error);
      return res
        .status(error.statusCode || 500)
        .json({ message: error.message || "Error interno." });
    }
  },
);

Router.get("/verificar-periferico/:dispositivo/:serial", async (req, res) => {
  const { dispositivo, serial } = req.params;
  const dispNorm = normalize(dispositivo);

  if (!PERIFERICOS_MAP[dispNorm] && !COMPONENTES_MAP[dispNorm]) {
    return res
      .status(400)
      .json({ message: "Dispositivo no registrado para búsqueda." });
  }

  try {
    const prefix = PERIFERICOS_MAP[dispNorm] ? "periferico" : "componente";
    const indexId = serialIndexId(prefix, serial);
    const snap = await db.collection(COL.indices).doc(indexId).get();

    if (!snap.exists) {
      return res.status(200).json({
        existe: false,
        asignado: false,
        message: `El ${prefix} está disponible y será registrado como nuevo.`,
      });
    }

    const data = snap.data();

    if (data.equipoId) {
      return res.status(200).json({
        existe: true,
        asignado: true,
        equipo: data.tipoEquipo || "Equipo",
        serialEquipo: data.equipoSerial || data.equipoId,
        message: `Este ${prefix} ya está asignado a un equipo (${data.tipoEquipo}) con serial: ${data.equipoSerial || data.equipoId}`,
      });
    }

    return res.status(200).json({
      existe: true,
      asignado: false,
      message: `El ${prefix} existe en la base de datos pero no está asignado a ningún equipo.`,
    });
  } catch (error) {
    console.error(`Error verificando asignación de ${dispositivo}:`, error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
});

Router.get("/:dispositivo/:id", async (req, res, next) => {
  const { dispositivo, id } = req.params;
  const dispNorm = normalize(dispositivo);

  let prefix = null;
  if (EQUIPOS_MAP[dispNorm] || dispNorm === "pc") prefix = "equipo";
  else if (PERIFERICOS_MAP[dispNorm]) prefix = "periferico";
  else if (COMPONENTES_MAP[dispNorm]) prefix = "componente";

  if (!prefix) return next();

  try {
    const indexId = serialIndexId(prefix, id);
    const snap = await db.collection(COL.indices).doc(indexId).get();

    if (snap.exists) {
      return res.status(200).json([{ serial: id }]);
    } else {
      return res.status(200).json([]);
    }
  } catch (error) {
    console.error(`Error obteniendo el serial en ${dispositivo}:`, error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
});

Router.get("/buscar/:serial", async (req, res) => {
  try {
    const serialNorm = normalize(req.params.serial);

    const snap = await db.collection(COL.equipos).get();

    const equipo = snap.docs.find(
      (doc) => normalize(doc.data().serial) === serialNorm,
    );

    if (!equipo) {
      return res.status(404).json({
        message: "Equipo no encontrado",
      });
    }

    return res.status(200).json({
      id: equipo.id,
      ...equipo.data(),
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error buscando equipo",
      error: error.message,
    });
  }
});

Router.get("/equipo/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const equipoRef = db.collection("equipos").doc(id);
    const equipoSnap = await equipoRef.get();

    if (!equipoSnap.exists) {
      return res.status(404).json({
        message: "El equipo solicitado no existe en el inventario.",
      });
    }

    const equipoData = equipoSnap.data();

    return res.status(200).json({
      id: equipoSnap.id,
      ...equipoData,
      componentes: equipoData.componentes || [],
      perifericos: equipoData.perifericos || [],
    });
  } catch (error) {
    console.error("Error al obtener el equipo:", error);
    return res
      .status(500)
      .json({ message: "Error interno al obtener el equipo." });
  }
});

export default Router;
