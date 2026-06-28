import express from "express";
import bcrypt from "bcrypt";
import crypto from "crypto";
import dotenv from "dotenv";
import { db } from "../config/firebase.js";
import { FieldValue } from "firebase-admin/firestore";
import jwt from "jsonwebtoken";
import { generarCambios } from "../controller/generarCambios.js";
import verificarToken from "../middleware/verificarToken.js";
import esSuperAdmin from "../middleware/esSuperAdmin.js";
import permitirEscritura from "../middleware/permitirEscritura.js";

import {
  normalize,
  sha1,
  badRequest,
  requireString,
} from "../utils/inventory.helpers.js";

import { locationRequiredFields } from "../utils/inventory.constants.js";

import {
  normalizeLocationInput,
  locationIdFromData,
} from "../utils/inventory.validators.js";

const Router = express.Router();
dotenv.config();
const COL_USUARIOS = "usuarios";
const COL_UBICACIONES = "ubicaciones";

Router.post("/usuarios", async (req, res) => {
  try {
    const {
      username,
      password,
      rol,
      cedula,
      nombre,
      apellido,
      correo,
      telefono,
      estado_persona,
      region,
      estado,
      ciudad,
      sede,
      piso,
      alas,
    } = req.body;

    requireString(username, "username");
    requireString(password, "password");
    requireString(cedula, "cedula");
    requireString(correo, "correo");

    const usernameNorm = username.trim().toLowerCase();
    const cedulaNorm = cedula.trim();

    // Armamos el objeto de ubicación con lo que viene del body
    const rawUbicacion = { region, estado, ciudad, sede, piso, alas };
    const normUbicacion = normalizeLocationInput(rawUbicacion, "usuario");
    const ubiId = locationIdFromData(normUbicacion);

    const userId = await db.runTransaction(async (tx) => {
      // 1. Validar duplicados
      const userRef = db.collection(COL_USUARIOS);

      const checkUsername = await tx.get(
        userRef.where("usernameNorm", "==", usernameNorm).limit(1),
      );
      if (!checkUsername.empty) {
        throw badRequest(`El nombre de usuario "${username}" ya está en uso.`);
      }

      const checkCedula = await tx.get(
        userRef.where("cedula", "==", cedulaNorm).limit(1),
      );
      if (!checkCedula.empty) {
        throw badRequest(`La cédula "${cedula}" ya se encuentra registrada.`);
      }

      // 2. Hash de contraseña
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // 3. Crear o actualizar la UBICACIÓN GLOBAL (La que ves en tu imagen)
      const ubiRef = db.collection(COL_UBICACIONES).doc(ubiId);
      const ubiSnap = await tx.get(ubiRef);
      if (!ubiSnap.exists) {
        tx.set(ubiRef, {
          ...normUbicacion,
          createdAt: FieldValue.serverTimestamp(),
        });
      }

      // 4. Crear documento del usuario
      const newDocRef = userRef.doc();
      const docPayload = {
        username: username.trim(),
        usernameNorm,
        password: hashedPassword,
        rol: rol?.trim() || "usuario",
        cedula: cedulaNorm,
        nombre: nombre?.trim() || "",
        apellido: apellido?.trim() || "",
        correo: correo?.trim() || "",
        telefono: telefono?.trim() || "",
        estado: estado_persona?.trim() || "activo",
        id_ubicacion: ubiId, // Guardamos la referencia global
        ubicacion: normUbicacion, // Desnormalizamos para no hacer JOIN en los GET
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
        reset_token: "",
        token_expires: "",
      };

      tx.set(newDocRef, docPayload);

      return newDocRef.id;
    });

    res
      .status(201)
      .json({ message: "Usuario creado exitosamente.", id_usuario: userId });
  } catch (e) {
    console.error("Error en el registro:", e);
    res.status(e.statusCode || 500).json({
      message: "No se pudo crear el usuario.",
      error: e.message,
    });
  }
});

Router.get("/usuarios", verificarToken, esSuperAdmin, async (req, res) => {
  try {
    const snapshot = await db
      .collection(COL_USUARIOS)
      .where("estado", "==", "activo")
      .get();

    const rows = snapshot.docs.map((doc) => {
      const data = doc.data();
      const ubi = data.ubicacion || {};

      return {
        id_usuario: doc.id,
        cedula: data.cedula,
        nombre: data.nombre,
        apellido: data.apellido,
        correo: data.correo,
        telefono: data.telefono,
        estado_persona: data.estado,
        username: data.username,
        rol: data.rol,

        region: ubi.region,
        estado: ubi.estado,
        ciudad: ubi.ciudad,
        sede: ubi.sede,
        piso: ubi.piso,
        alas: ubi.ala,

        id_region: ubi.region,
        id_estado: ubi.estado,
        id_ciudad: ubi.ciudad,
        id_sede: ubi.sede,
        id_piso: ubi.piso,
      };
    });

    res.status(200).json(rows);
  } catch (e) {
    res.status(500).json({
      message: "No se pudieron obtener los usuarios.",
      error: e.message,
    });
  }
});

Router.put("/usuarios/:id", verificarToken, async (req, res) => {
  try {
    const { id } = req.params;
    const newData = req.body;
    const usuarioQueEdita = req.user.username;

    const {
      username,
      rol,
      cedula,
      nombre,
      apellido,
      correo,
      telefono,
      password,
      region,
      estado,
      ciudad,
      sede,
      piso,
      alas,
    } = req.body;

    const rawUbicacion = { region, estado, ciudad, sede, piso, alas };
    const normUbicacion = normalizeLocationInput(rawUbicacion, "usuario");
    const ubiId = locationIdFromData(normUbicacion);

    await db.runTransaction(async (tx) => {
      const userRef = db.collection(COL_USUARIOS).doc(id);
      const userSnap = await tx.get(userRef);

      if (!userSnap.exists) {
        throw badRequest("Usuario no encontrado.");
      }

      const oldData = userSnap.data();

      // 1. Actualizar/Crear en colección global de ubicaciones
      const ubiRef = db.collection(COL_UBICACIONES).doc(ubiId);
      const ubiSnap = await tx.get(ubiRef);
      if (!ubiSnap.exists) {
        tx.set(ubiRef, {
          ...normUbicacion,
          createdAt: FieldValue.serverTimestamp(),
        });
      }

      // 2. Preparar datos de actualización
      const updateData = {
        username: username?.trim(),
        usernameNorm: username?.trim().toLowerCase(),
        rol: rol?.trim(),
        cedula: cedula?.trim(),
        nombre: nombre?.trim(),
        apellido: apellido?.trim(),
        correo: correo?.trim(),
        telefono: telefono?.trim(),
        estado: "activo",
        id_ubicacion: ubiId,
        ubicacion: normUbicacion,
        updatedAt: FieldValue.serverTimestamp(),
      };

      if (password && password.trim() !== "") {
        updateData.password = await bcrypt.hash(password, 10);
      }

      const listaCambios = generarCambios(oldData, {
        ...updateData,
        password: password,
      });

      tx.update(userRef, updateData);

      if (listaCambios.length > 0) {
        const bitacoraRef = db.collection("bitacora").doc();
        tx.set(bitacoraRef, {
          usuario: usuarioQueEdita,
          id_modificado: id,
          accion: "Actualización de usuario",
          detalles: listaCambios,
          fecha: FieldValue.serverTimestamp(),
          sede: oldData.ubicacion?.sede || "N/A",
        });
      }
    });

    res.status(200).json({
      message: "Usuario actualizado y cambios registrados en bitácora.",
    });
  } catch (e) {
    res
      .status(e.statusCode || 500)
      .json({ message: "Error actualizando usuario.", error: e.message });
  }
});

/* =========================
  PUT: ELIMINACIÓN LÓGICA
========================= */
Router.put("/usuarios/eliminado/:id", verificarToken, async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user.username;
    const sede = req.user.sede;

    const userRef = db.collection(COL_USUARIOS).doc(id);
    const userSnap = await userRef.get();

    if (!userSnap.exists)
      return res.status(404).json({ message: "Usuario no encontrado." });

    // con esto obtendremos los datos del usuario
    const datos = userSnap.data();
    const nombre = datos.username || datos.nombre || "Desconocido";

    await userRef.update({
      estado: "inactivo",
      updatedAt: FieldValue.serverTimestamp(),
    });

    const listaCambios = [];
    listaCambios.push(`Se inactivó al usuario: ${nombre}`);

    const bitacoraRef = db.collection("bitacora").doc();
    await bitacoraRef.set({
      usuario: user,
      id_modificado: id,
      accion: "Eliminar usuario",
      detalles: listaCambios,
      fecha: FieldValue.serverTimestamp(),
      sede: sede,
    });

    res.status(200).json({ message: "Usuario eliminado (lógicamente)." });
  } catch (e) {
    res
      .status(500)
      .json({ message: "Error al eliminar usuario.", error: e.message });
  }
});

Router.post("/login", async (req, res) => {
  const { correo, password } = req.body;
  try {
    const snapshot = await db
      .collection("usuarios")
      .where("correo", "==", correo)
      .limit(1)
      .get();

    if (snapshot.empty) {
      return res.status(401).json({ message: "Credenciales inválidas" });
    }

    const doc = snapshot.docs[0];
    const usuario = doc.data();

    if (usuario.estado !== "activo") {
      return res.status(403).json({ message: "Usuario se encuentra inactivo" });
    }
    const match =
      password === usuario.password ||
      (await bcrypt.compare(password, usuario.password));

    if (!match) {
      return res.status(401).json({ message: "Credenciales inválidas" });
    }

    const usuarioData = doc.data();
    const rol = usuarioData.rol || "Usuario";
    const sede = usuario.ubicacion?.sede || null;

    const token = jwt.sign(
      {
        id: doc.id,
        rol: rol,
        sede: sede,
        username: usuarioData.username,
        correo: usuarioData.correo,
      },
      process.env.JWT_SECRET || "lol",
      { expiresIn: "1h" },
    );

    res.cookie("acceso_token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 3600000,
    });
    const listaCambios = [];

    listaCambios.push("Inicio de Sesión");

    const bitacoraRef = db.collection("bitacora").doc();
    await bitacoraRef.set({
      usuario: usuario.username,
      id_modificado: 0,
      accion: "Login",
      detalles: listaCambios,
      fecha: FieldValue.serverTimestamp(),
      sede: sede,
    });

    return res.status(200).json({
      message: "Login exitoso",
      token,
      user: {
        correo: usuario.correo,
        username: usuario.username,
        sede: usuario.sede,
        rol: usuario.rol,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: "Error en el servidor" });
  }
});

//para cerrar sesion
Router.post("/logout", (req, res) => {
  res.clearCookie("acceso_token");
  return res.status(200).json({ message: "Sesión cerrada" });
});

// api para obtener la info de jwt
Router.get("/me", verificarToken, (req, res) => {
  return res.status(200).json({
    autenticado: true,
    user: {
      correo: req.user.correo,
      username: req.user.username,
      rol: req.user.rol,
      sede: req.user.sede,
    },
  });
});
export default Router;
