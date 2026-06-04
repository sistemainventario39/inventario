import express from "express";
import pool from "../config/bd.js";

const Router = express.Router();

const getFechaVenezuela = () => {
  return new Date().toLocaleString("sv-SE", { timeZone: "America/Caracas" });
};

Router.post("/pc", async (req, res) => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const {
      marca,
      modelo,
      serial,
      estado,
      notas,
      procedencia,
      asignacion,
      componentes = [],
      perifericos = [],
    } = req.body;
    const fechaHoraRegistro = getFechaVenezuela();

    const [pcExiste] = await connection.execute(
      `SELECT id_pc FROM pc WHERE serial = ?`,
      [serial],
    );
    if (pcExiste.length > 0) {
      await connection.rollback();
      return res.status(400).json({
        message: "El número de serie de esta PC ya se encuentra registrado.",
      });
    }
    const [ubiP] = await connection.execute(
      `INSERT INTO ubicacion (id_region, id_estado, id_ciudad, id_sede, id_piso) VALUES (?, ?, ?, ?, ?)`,
      [
        procedencia.id_region,
        procedencia.id_estado,
        procedencia.id_ciudad,
        procedencia.id_sede,
        procedencia.id_piso,
      ],
    );
    const id_procedencia = ubiP.insertId;

    const [ubiA] = await connection.execute(
      `INSERT INTO ubicacion (id_region, id_estado, id_ciudad, id_sede, id_piso) VALUES (?, ?, ?, ?, ?)`,
      [
        asignacion.id_region,
        asignacion.id_estado,
        asignacion.id_ciudad,
        asignacion.id_sede,
        asignacion.id_piso,
      ],
    );
    const id_asignacion = ubiA.insertId;

    const [pcResult] = await connection.execute(
      `INSERT INTO pc (marca,modelo, serial, estado, fecha, notas, id_procedencia, id_asignacion) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        marca,
        modelo,
        serial,
        estado,
        fechaHoraRegistro,
        notas || null,
        id_procedencia,
        id_asignacion,
      ],
    );
    const id_pc = pcResult.insertId;

    for (const componente of componentes) {
      const id_componente = await crearComponente(
        connection,
        componente.tipo,
        componente,
        id_procedencia,
        id_asignacion,
        fechaHoraRegistro,
      );

      await connection.execute(
        `INSERT INTO pc_componentes (id_pc, tipo_componente, id_componente) VALUES (?, ?, ?)`,
        [id_pc, componente.tipo, id_componente],
      );
    }

    for (const peri of perifericos) {
      const tipo_peri = peri.tipo.toLowerCase();

      const [existePeri] = await connection.execute(
        `SELECT * FROM ${tipo_peri} WHERE serial = ?`,
        [peri.serial],
      );

      let id_periferico;

      if (existePeri.length > 0) {
        const colId = `id_${tipo_peri === "teclados" ? "teclado" : tipo_peri}`;
        id_periferico = existePeri[0][colId];

        const [enPc] = await connection.execute(
          `SELECT id_pc FROM pc_perifericos WHERE tipo_periferico = ? AND id_periferico = ?`,
          [tipo_peri, id_periferico],
        );
        const [enLap] = await connection.execute(
          `SELECT id_laptop FROM laptop_perifericos WHERE tipo_periferico = ? AND id_periferico = ?`,
          [tipo_peri, id_periferico],
        );

        if (enPc.length > 0 || enLap.length > 0) {
          await connection.rollback();
          return res.status(400).json({
            message: `El periférico (${peri.tipo}) con serial ${peri.serial} ya está vinculado a otro equipo.`,
          });
        }
      } else {
        const [insertPeri] = await connection.execute(
          `INSERT INTO ${tipo_peri} (marca,modelo, serial, estado, fecha, id_procedencia, id_asignacion) VALUES (?, ?, ?, ?, ?, ?)`,
          [
            peri.marca || "Genérico",
            peri.modelo || "Genérico",
            peri.serial,
            peri.estado,
            fechaHoraRegistro,
            id_procedencia,
            id_asignacion,
          ],
        );
        id_periferico = insertPeri.insertId;
      }

      await connection.execute(
        `INSERT INTO pc_perifericos (id_pc, tipo_periferico, id_periferico) VALUES (?, ?, ?)`,
        [id_pc, tipo_peri, id_periferico],
      );
    }

    await connection.commit();
    res.status(201).json({
      message: "PC registrada con éxito junto a todos sus periféricos.",
      id_pc,
    });
  } catch (error) {
    await connection.rollback();
    console.error("Error en POST /pc:", error);
    res.status(500).json({
      message: "Error interno del servidor al registrar la PC",
      error: error.message,
    });
  } finally {
    connection.release();
  }
});

Router.post("/laptop", async (req, res) => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const {
      modelo,
      serial,
      estado,
      notas,
      procedencia,
      asignacion,
      componentes = [],
      perifericos = [],
    } = req.body;

    // Obtener la hora exacta de Venezuela justo en el momento del registro
    const fechaHoraRegistro = getFechaVenezuela();

    const [lapExiste] = await connection.execute(
      `SELECT id_laptop FROM pc WHERE serial = ?`,
      [serial],
    );
    if (lapExiste.length > 0) {
      await connection.rollback();
      return res.status(400).json({
        message:
          "El número de serie de esta LAPTOP ya se encuentra registrado.",
      });
    }

    const [ubiP] = await connection.execute(
      `INSERT INTO ubicacion (id_region, id_estado, id_ciudad, id_sede, id_piso) VALUES (?, ?, ?, ?, ?)`,
      [
        procedencia.id_region,
        procedencia.id_estado,
        procedencia.id_ciudad,
        procedencia.id_sede,
        procedencia.id_piso,
      ],
    );
    const id_procedencia = ubiP.insertId;

    const [ubiA] = await connection.execute(
      `INSERT INTO ubicacion (id_region, id_estado, id_ciudad, id_sede, id_piso) VALUES (?, ?, ?, ?, ?)`,
      [
        asignacion.id_region,
        asignacion.id_estado,
        asignacion.id_ciudad,
        asignacion.id_sede,
        asignacion.id_piso,
      ],
    );
    const id_asignacion = ubiA.insertId;

    const [lapResult] = await connection.execute(
      `INSERT INTO laptop (marca, modelo, serial, estado, fecha, notas, id_procedencia, id_asignacion) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        marca,
        modelo,
        serial,
        estado,
        fechaHoraRegistro,
        notas || null,
        id_procedencia,
        id_asignacion,
      ],
    );
    const id_laptop = lapResult.insertId;

    for (const componente of componentes) {
      const id_componente = await crearComponente(
        connection,
        componente.tipo,
        componente,
        id_procedencia,
        id_asignacion,
        fechaHoraRegistro,
      );

      await connection.execute(
        `INSERT INTO laptop_componentes (id_pc, tipo_componente, id_componente) VALUES (?, ?, ?)`,
        [id_laptop, componente.tipo, id_componente],
      );
    }

    for (const peri of perifericos) {
      const tipo_peri = peri.tipo.toLowerCase();

      // Consultar si ya existe en su respectiva tabla matriz
      const [existePeri] = await connection.execute(
        `SELECT * FROM ${tipo_peri} WHERE serial = ?`,
        [peri.serial],
      );

      let id_periferico;

      if (existePeri.length > 0) {
        const colId = `id_${tipo_peri === "teclados" ? "teclado" : tipo_peri}`;
        id_periferico = existePeri[0][colId];

        const [enPc] = await connection.execute(
          `SELECT id_pc FROM pc_perifericos WHERE tipo_periferico = ? AND id_periferico = ?`,
          [tipo_peri, id_periferico],
        );
        const [enLap] = await connection.execute(
          `SELECT id_laptop FROM laptop_perifericos WHERE tipo_periferico = ? AND id_periferico = ?`,
          [tipo_peri, id_periferico],
        );

        if (enPc.length > 0 || enLap.length > 0) {
          await connection.rollback();
          return res.status(400).json({
            message: `El periférico (${peri.tipo}) con serial ${peri.serial} ya está vinculado a otro equipo.`,
          });
        }
      } else {
        const [insertPeri] = await connection.execute(
          `INSERT INTO ${tipo_peri} (marca,modelo, serial, estado, fecha, id_procedencia, id_asignacion) VALUES (?, ?, ?, ?, ?, ?)`,
          [
            peri.marca || "Genérico",
            peri.modelo || "Genérico",
            peri.serial,
            peri.estado,
            fechaHoraRegistro,
            id_procedencia,
            id_asignacion,
          ],
        );
        id_periferico = insertPeri.insertId;
      }

      await connection.execute(
        `INSERT INTO laptop_perifericos (id_pc, tipo_periferico, id_periferico) VALUES (?, ?, ?)`,
        [id_pc, tipo_peri, id_periferico],
      );
    }

    await connection.commit();
    res.status(201).json({
      message: "PC registrada con éxito junto a todos sus periféricos.",
      id_laptop,
    });
  } catch (error) {
    await connection.rollback();
    console.error("Error en POST /laptop:", error);
    res.status(500).json({
      message: "Error interno del servidor al registrar la laptop",
      error: error.message,
    });
  } finally {
    connection.release();
  }
});
const crearComponente = async (
  connection,
  tabla,
  data,
  id_procedencia,
  id_asignacion,
  fechaHora,
) => {
  const [existe] = await connection.execute(
    `SELECT * FROM ${tabla} WHERE serial = ?`,
    [data.serial],
  );

  if (existe.length > 0) {
    return existe[0][`id_${tabla}`];
  }

  let campos = `marca, modelo, serial, estado, fecha, notas, id_procedencia, id_asignacion`;
  let placeholders = `?, ?, ?, ?, ?, ?, ?`;
  let valores = [
    data.marca || "Genérico",
    data.modelo || "Genérico",
    data.serial,
    data.estado,
    fechaHora,
    data.notas || null,
    id_procedencia,
    id_asignacion,
  ];

  if (tabla === "memoria_ram" || tabla === "disco_duro") {
    campos += `, capacidad`;
    placeholders += `, ?`;
    valores.push(data.capacidad);
  }

  const [result] = await connection.execute(
    `INSERT INTO ${tabla} (${campos}) VALUES (${placeholders})`,
    valores,
  );
  return result.insertId;
};

//para verificar si el serial existe en el sistema.
Router.get("/:dispositivo/:id", async (req, res) => {
  const { dispositivo, id } = req.params;

  let tablita = "";

  switch (dispositivo.toLowerCase()) {
    case "cpu":
    case "pc":
      tablita = "PC";
      break;
    case "laptop":
      tablita = "LAPTOP";
      break;
    case "monitor":
      tablita = "MONITOR";
      break;
    case "teclados":
      tablita = "TECLADOS";
      break;
    case "mouse":
      tablita = "MOUSE";
      break;
    case "switch":
      tablita = "SWITCH";
      break;
    case "impresora":
      tablita = "IMPRESORA";
      break;
    case "cornetas":
      tablita = "CORNETAS";
      break;
    default:
      return res
        .status(400)
        .json({ message: "Periferico, no esta registrado." });
  }

  try {
    const query = `SELECT serial FROM ${tablita} WHERE serial = ?`;
    const [rows] = await pool.execute(query, [id]);

    res.status(200).json(rows);
  } catch (e) {
    console.error(`Lol. Error obteniendo el serial en la tabla ${tablita}:`, e);
    res.status(500).json({ message: "Error interno del servidor" });
  }
});

Router.get("/verificar-periferico/:dispositivo/:serial", async (req, res) => {
  const { dispositivo, serial } = req.params;

  let tablita = "";
  let idColumna = "";
  let tipoPeriferico = dispositivo.toLowerCase();

  switch (tipoPeriferico) {
    case "monitor":
      tablita = "monitor";
      idColumna = "id_monitor";
      break;
    case "teclados":
    case "teclado":
      tablita = "teclados";
      idColumna = "id_teclado";
      break;
    case "mouse":
      tablita = "mouse";
      idColumna = "id_mouse";
      break;
    case "impresora":
      tablita = "impresora";
      idColumna = "id_impresora";
      break;
    case "cornetas":
    case "corneta":
      tablita = "cornetas";
      idColumna = "id_corneta";
      break;
    default:
      return res
        .status(400)
        .json({ message: "Periférico no registrado para búsqueda." });
  }

  try {
    const queryPeriferico = `SELECT * FROM ${tablita} WHERE serial = ?`;
    const [rowsPeriferico] = await pool.execute(queryPeriferico, [serial]);

    if (rowsPeriferico.length === 0) {
      return res.status(200).json({
        existe: false,
        message: "El periférico está disponible y será registrado como nuevo.",
      });
    }

    const idDelPeriferico = rowsPeriferico[0][idColumna];

    const queryPC = `
      SELECT pc.serial 
      FROM pc_perifericos pp
      INNER JOIN pc ON pp.id_pc = pc.id_pc
      WHERE pp.tipo_periferico = ? AND pp.id_periferico = ?
    `;
    const [enPC] = await pool.execute(queryPC, [
      tipoPeriferico,
      idDelPeriferico,
    ]);

    if (enPC.length > 0) {
      return res.status(200).json({
        existe: true,
        asignado: true,
        equipo: "PC",
        serialEquipo: enPC[0].serial,
        message: `Este periférico ya está asignado a la PC con serial: ${enPC[0].serial}`,
      });
    }

    const queryLaptop = `
      SELECT l.serial 
      FROM laptop_perifericos lp
      INNER JOIN laptop l ON lp.id_laptop = l.id_laptop
      WHERE lp.tipo_periferico = ? AND lp.id_periferico = ?
    `;
    const [enLaptop] = await pool.execute(queryLaptop, [
      tipoPeriferico,
      idDelPeriferico,
    ]);

    if (enLaptop.length > 0) {
      return res.status(200).json({
        existe: true,
        asignado: true,
        equipo: "Laptop",
        serialEquipo: enLaptop[0].serial,
        message: `Este periférico ya está asignado a la Laptop con serial: ${enLaptop[0].serial}`,
      });
    }

    return res.status(200).json({
      existe: true,
      asignado: false,
      message:
        "El periférico existe en la base de datos pero no está asignado a ningún equipo.",
    });
  } catch (e) {
    console.error(`Error verificando asignación en tabla ${tablita}:`, e);
    res.status(500).json({ message: "Error interno del servidor" });
  }
});

Router.post("/perifericos/:tipo", async (req, res) => {
  const { tipo } = req.params;
  let tabla = "";

  // Mapeamos el parámetro de la URL con el nombre exacto de tu tabla en BD
  switch (tipo.toLowerCase()) {
    case "monitor":
      tabla = "monitor";
      break;
    case "teclado":
      tabla = "teclados";
      break; // En plural según tu BD
    case "mouse":
      tabla = "mouse";
      break;
    case "switch":
      tabla = "switches";
      break; // En plural según tu imagen
    case "impresora":
      tabla = "impresora";
      break;
    case "corneta":
      tabla = "cornetas";
      break; // En plural
    default:
      return res.status(400).json({ message: "Tipo de equipo inválido." });
  }

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const { modelo, serial, estado, notas, procedencia, asignacion } = req.body;

    const fechaHoraRegistro = getFechaVenezuela();

    const [existe] = await connection.execute(
      `SELECT * FROM ${tabla} WHERE serial = ?`,
      [serial],
    );
    if (existe.length > 0) {
      await connection.rollback();
      return res.status(400).json({
        message: `El número de serie de este equipo (${tipo}) ya se encuentra registrado.`,
      });
    }

    const [ubiP] = await connection.execute(
      `INSERT INTO ubicacion (id_region, id_estado, id_ciudad, id_sede, id_piso) VALUES (?, ?, ?, ?, ?)`,
      [
        procedencia.id_region,
        procedencia.id_estado,
        procedencia.id_ciudad,
        procedencia.id_sede,
        procedencia.id_piso,
      ],
    );
    const id_procedencia = ubiP.insertId;

    const [ubiA] = await connection.execute(
      `INSERT INTO ubicacion (id_region, id_estado, id_ciudad, id_sede, id_piso) VALUES (?, ?, ?, ?, ?)`,
      [
        asignacion.id_region,
        asignacion.id_estado,
        asignacion.id_ciudad,
        asignacion.id_sede,
        asignacion.id_piso,
      ],
    );
    const id_asignacion = ubiA.insertId;

    const [result] = await connection.execute(
      `INSERT INTO ${tabla} (modelo, serial, estado, fecha, notas, id_procedencia, id_asignacion) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        modelo,
        serial,
        estado,
        fechaHoraRegistro,
        notas || null,
        id_procedencia,
        id_asignacion,
      ],
    );

    await connection.commit();
    res.status(201).json({
      message: `${tipo} registrado correctamente en el sistema.`,
      id: result.insertId,
    });
  } catch (error) {
    await connection.rollback();
    console.error(`Error en POST /perifericos/independiente/${tipo}:`, error);
    res.status(500).json({
      message: "Error interno del servidor al registrar el equipo.",
      error: error.message,
    });
  } finally {
    connection.release();
  }
});

Router.get("/componentes", async (req, res) => {
  const connection = await pool.getConnection();

  try {
    const query = `
      WITH TodosLosComponentes AS (
        SELECT id_pc AS id, 'PC' AS tipo, marca, modelo, serial, estado, id_asignacion FROM pc
        UNION ALL
        SELECT id_monitor AS id, 'Monitor' AS tipo, marca, modelo, serial, estado, id_asignacion FROM monitor
        UNION ALL
        SELECT id_teclado AS id, 'Teclado' AS tipo, marca, modelo, serial, estado, id_asignacion FROM teclados
        UNION ALL
        SELECT id_mouse AS id, 'Mouse' AS tipo, marca, modelo, serial, estado, id_asignacion FROM mouse
        UNION ALL
        SELECT id_corneta AS id, 'Cornetas' AS tipo, marca, modelo, serial, estado, id_asignacion FROM cornetas
        UNION ALL
        SELECT id_switch AS id, 'Switches' AS tipo, marca, modelo, serial, estado, id_asignacion FROM switches
        UNION ALL
        SELECT id_impresora AS id, 'Impresoras' AS tipo, marca, modelo, serial, estado, id_asignacion FROM impresora
        UNION ALL
        SELECT id_laptop AS id, 'Laptop' AS tipo, marca, modelo, serial, estado, id_asignacion FROM laptop
      )
      SELECT 
        t.id,
        t.tipo,
        t.marca,
        t.modelo,
        t.serial,
        t.estado AS estado_componente,
        
        ub.id_region,
        ub.id_estado,
        ub.id_ciudad,
        ub.id_sede,
        ub.id_piso,

        r.region,
        e.estado AS nombre_estado_region,
        c.ciudad,
        s.sede,
        pi.piso

      FROM TodosLosComponentes t

      -- Aquí hacemos la conexión clave: id_asignacion del componente con id_ubicacion
      LEFT JOIN ubicacion ub 
      ON t.id_asignacion = ub.id_ubicacion

      -- A partir de aquí, traemos los nombres reales de la ubicación igual que en usuarios
      LEFT JOIN region r 
      ON ub.id_region = r.id_region

      LEFT JOIN estados e 
      ON ub.id_estado = e.id_estado

      LEFT JOIN ciudades c 
      ON ub.id_ciudad = c.id_ciudad

      LEFT JOIN sede s 
      ON ub.id_sede = s.id_sede

      LEFT JOIN piso pi 
      ON ub.id_piso = pi.id_piso;
    `;

    const [rows] = await connection.execute(query);

    res.status(200).json(rows);
  } catch (e) {
    console.error("Error al obtener los componentes:", e);
    res.status(500).json({
      message: "No se pudieron obtener los componentes del inventario",
      error: e.message,
    });
  } finally {
    connection.release();
  }
});
export default Router;
