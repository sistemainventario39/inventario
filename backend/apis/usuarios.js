import express from "express";
import pool from "../config/bd.js";
import bcrypt from "bcrypt";

const Router = express.Router();

Router.post("/usuarios", async (req, res) => {
  const {
    id_region,
    id_estado,
    id_ciudad,
    id_sede,
    id_piso,
    username,
    password,
    rol,
    cedula,
    nombre,
    apellido,
    correo,
    telefono,
    estado_persona,
  } = req.body;

  const connection = await pool.getConnection();

  try {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    await connection.beginTransaction();

    const queryUbicacion = `
      INSERT INTO ubicacion (id_region, id_estado, id_ciudad, id_sede, id_piso) 
      VALUES (?, ?, ?, ?, ?)`;
    const [ubi] = await connection.execute(queryUbicacion, [
      id_region,
      id_estado,
      id_ciudad,
      id_sede,
      id_piso,
    ]);
    //con el isertId recuperamos el id o clave primaria de la tabla ubicación
    const id_ubicacion = ubi.insertId;

    const queryUsuario = `
      INSERT INTO usuarios (username, password, rol) 
      VALUES (?, ?, ?)`;
    const [usi] = await connection.execute(queryUsuario, [
      username,
      hashedPassword,
      rol,
    ]);
    const id_usuario = usi.insertId;

    const queryPersona = `
      INSERT INTO personas (cedula, nombre, apellido, correo, telefono, estado, id_usuario, id_ubicacion) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
    await connection.execute(queryPersona, [
      cedula,
      nombre,
      apellido,
      correo,
      telefono,
      estado_persona || "activo",
      id_usuario,
      id_ubicacion,
    ]);

    await connection.commit();
    res.status(201).json({ message: "Lol. Usuario creado." });
  } catch (e) {
    await connection.rollback();
    console.error("Error en el registro:", e);
    res
      .status(500)
      .json({ message: "No se pudo crear el usuario jaja", error: e.message });
  } finally {
    connection.release();
  }
});

Router.get("/usuarios", async (req, res) => {
  const connection = await pool.getConnection();

  try {
    const query = `
      SELECT
      u.id_usuario,

      p.cedula,
      p.nombre,
      p.apellido,
      p.correo,
      p.telefono,
      p.estado AS estado_persona,

      u.username,
      u.rol,

      ub.id_region,
      ub.id_estado,
      ub.id_ciudad,
      ub.id_sede,
      ub.id_piso,


      r.region,
      e.estado,
      c.ciudad,
      s.sede,
      pi.piso,
      pi.alas

      FROM personas p

      INNER JOIN usuarios u
      ON p.id_usuario = u.id_usuario

      INNER JOIN ubicacion ub
      ON p.id_ubicacion = ub.id_ubicacion

      LEFT JOIN region r
      ON ub.id_region = r.id_region

      LEFT JOIN estados e
      ON ub.id_estado = e.id_estado

      LEFT JOIN ciudades c
      ON ub.id_ciudad = c.id_ciudad

      LEFT JOIN sede s
      ON ub.id_sede = s.id_sede

      LEFT JOIN piso pi
      ON ub.id_piso = pi.id_piso

      WHERE p.estado = "activo";

    `;
    const [rows] = await connection.execute(query);

    res.status(200).json(rows);
  } catch (e) {
    console.error("Error al obtener usuarios:", e);
    res.status(500).json({
      message: "No se pudieron obtener los usuarios",
      error: e.message,
    });
  } finally {
    connection.release();
  }
});

Router.put("/usuarios/:id", async (req, res) => {
  const { id } = req.params;

  const {
    id_region,
    id_estado,
    id_ciudad,
    id_sede,
    id_piso,
    username,
    rol,
    cedula,
    nombre,
    apellido,
    correo,
    telefono,
    password,
  } = req.body;

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [usuarioActual] = await connection.execute(
      `
      SELECT 
        p.id_ubicacion,
        p.id_usuario
      FROM personas p
      WHERE p.id_usuario = ?
      `,
      [id],
    );

    if (usuarioActual.length === 0) {
      return res.status(404).json({
        message: "Usuario no encontrado",
      });
    }

    const { id_ubicacion } = usuarioActual[0];

    await connection.execute(
      `
      UPDATE ubicacion
      SET
        id_region = ?,
        id_estado = ?,
        id_ciudad = ?,
        id_sede = ?,
        id_piso = ?
      WHERE id_ubicacion = ?
      `,
      [id_region, id_estado, id_ciudad, id_sede, id_piso, id_ubicacion],
    );

    if (password && password.trim() !== "") {
      const hashedPassword = await bcrypt.hash(password, 10);

      await connection.execute(
        `
        UPDATE usuarios
        SET
          username = ?,
          rol = ?,
          password = ?
        WHERE id_usuario = ?
        `,
        [username, rol, hashedPassword, id],
      );
    } else {
      await connection.execute(
        `
        UPDATE usuarios
        SET
          username = ?,
          rol = ?
        WHERE id_usuario = ?
        `,
        [username, rol, id],
      );
    }

    await connection.execute(
      `
      UPDATE personas
      SET
        cedula = ?,
        nombre = ?,
        apellido = ?,
        correo = ?,
        telefono = ?,
        estado = ?
      WHERE id_usuario = ?
      `,
      [cedula, nombre, apellido, correo, telefono, "activo", id],
    );

    await connection.commit();

    res.status(200).json({
      message: "Usuario actualizado correctamente",
    });
  } catch (e) {
    await connection.rollback();

    console.error("Error actualizando usuario:", e);

    res.status(500).json({
      message: "Error actualizando usuario",
      error: e.message,
    });
  } finally {
    connection.release();
  }
});

Router.put("/usuarios/eliminado/:id", async (req, res) => {
  const { id } = req.params;

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    await connection.execute(
      `
      UPDATE personas
      SET estado = ?
      WHERE id_usuario = ?
      `,
      ["inactivo", id],
    );

    await connection.commit();

    res.status(200).json({
      message: "Usuario eliminado (lógicamente)",
    });
  } catch (e) {
    await connection.rollback();

    console.error("Error actualizando usuario:", e);

    res.status(500).json({
      message: "Error actualizando usuario",
      error: e.message,
    });
  } finally {
    connection.release();
  }
});
export default Router;
