import express from "express";
import PDFDocument from "pdfkit";
import * as XLSX from "xlsx";
import { db } from "../config/firebase.js";
import verificarToken from "../middleware/verificarToken.js";
import { normalize } from "../utils/inventory.helpers.js";
import { CANONICAL_TIPOS } from "../utils/inventory.constants.js";

const Router = express.Router();

function getCanonicalTipo(tipo) {
  const trimmed = String(tipo || "").trim();
  if (!trimmed) return "";
  const key = normalize(trimmed);
  if (CANONICAL_TIPOS[key]) return CANONICAL_TIPOS[key];
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
}

function mapItem(doc) {
  const data = doc.data();
  return {
    id: doc.id,
    tipo: getCanonicalTipo(data.tipo),
    marca: data.marca || "",
    modelo: data.modelo || "",
    serial: data.serial || "",
    estado: data.estado || "",
    notas: data.notas || "",
    region: data.asignacion?.region || null,
    estado_region: data.asignacion?.estado || null,
    ciudad: data.asignacion?.ciudad || null,
    sede: data.asignacion?.sede || data.sede || null,
    piso: data.asignacion?.piso || null,
    ala: data.asignacion?.ala || null,
  };
}

function userCanSeeItem(data, rol, sedeUsuarioNormalizada) {
  if (rol === "Superadministrador") return true;

  const sedeComponente = data.asignacion?.sede?.trim().toLowerCase() || null;
  const torreComponente = data.sede?.trim().toLowerCase() || null;

  return (
    sedeComponente === sedeUsuarioNormalizada ||
    torreComponente === sedeUsuarioNormalizada
  );
}

async function fetchInventario(user) {
  const { rol, sede } = user;

  if (rol !== "Superadministrador" && !sede) {
    return [];
  }

  const sedeUsuarioNormalizada = sede?.trim().toLowerCase();

  const [equiposSnap, perifericosSnap] = await Promise.all([
    db.collection("equipos").get(),
    db.collection("perifericos").get(),
  ]);

  const resultado = [];

  equiposSnap.forEach((doc) => {
    const data = doc.data();
    if (userCanSeeItem(data, rol, sedeUsuarioNormalizada)) {
      resultado.push(mapItem(doc));
    }
  });

  perifericosSnap.forEach((doc) => {
    const data = doc.data();
    if (userCanSeeItem(data, rol, sedeUsuarioNormalizada)) {
      resultado.push(mapItem(doc));
    }
  });

  return resultado;
}

async function fetchTiposFromDB() {
  const [equiposSnap, perifericosSnap] = await Promise.all([
    db.collection("equipos").get(),
    db.collection("perifericos").get(),
  ]);

  const tiposUnicos = new Set();

  equiposSnap.forEach((doc) => {
    const tipo = doc.data().tipo;
    if (tipo?.trim()) tiposUnicos.add(normalize(tipo));
  });

  perifericosSnap.forEach((doc) => {
    const tipo = doc.data().tipo;
    if (tipo?.trim()) tiposUnicos.add(normalize(tipo));
  });

  return [...tiposUnicos]
    .map((key) => getCanonicalTipo(key))
    .sort((a, b) => a.localeCompare(b, "es"));
}

function parseArrayParam(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value.filter(Boolean);
  return String(value)
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);
}

function filterInventario(data, query) {
  const {
    tipo,
    search = "",
    estados = "",
    modelos = "",
    sedes = "",
    tipos = "",
  } = query;

  const estadosArr = parseArrayParam(estados);
  const modelosArr = parseArrayParam(modelos);
  const sedesArr = parseArrayParam(sedes);
  const tiposArr = parseArrayParam(tipos);
  const searchNorm = normalize(search);
  const tipoNorm = normalize(tipo);

  return data.filter((item) => {
    if (tipoNorm && tipoNorm !== "completa" && tipoNorm !== "completo") {
      if (normalize(item.tipo) !== tipoNorm) return false;
    }

    if (tiposArr.length > 0) {
      const itemTipoNorm = normalize(item.tipo);
      const matchesTipo = tiposArr.some((t) => normalize(t) === itemTipoNorm);
      if (!matchesTipo) return false;
    }

    if (searchNorm) {
      const matchesSearch =
        normalize(item.marca).includes(searchNorm) ||
        normalize(item.serial).includes(searchNorm);
      if (!matchesSearch) return false;
    }

    if (estadosArr.length > 0 && !estadosArr.includes(item.estado)) {
      return false;
    }

    if (modelosArr.length > 0 && !modelosArr.includes(item.modelo)) {
      return false;
    }

    if (sedesArr.length > 0 && !sedesArr.includes(item.sede)) {
      return false;
    }

    return true;
  });
}

const EXCEL_HEADERS = [
  "Tipo",
  "Serial",
  "Marca",
  "Modelo",
  "Ubicación",
  "Estado",
  "Observaciones",
];

function toExportRows(data) {
  return data.map((item) => ({
    Tipo: item.tipo,
    Serial: item.serial,
    Marca: item.marca,
    Modelo: item.modelo,
    Ubicación: item.sede || "",
    Estado: item.estado,
    Observaciones: item.notas || "",
  }));
}

function toExcelData(rows) {
  return [
    EXCEL_HEADERS,
    ...rows.map((row) => EXCEL_HEADERS.map((header) => row[header] ?? "")),
  ];
}

function buildFileName(formato, tipo) {
  const fecha = new Date().toISOString().slice(0, 10);
  const tipoLabel =
    !tipo || normalize(tipo) === "completa" || normalize(tipo) === "completo"
      ? "informacion-completa"
      : normalize(tipo).replace(/\s+/g, "-");
  const ext = formato === "pdf" ? "pdf" : "xlsx";
  return `inventario-${tipoLabel}-${fecha}.${ext}`;
}

function generateExcelBuffer(rows) {
  const data = toExcelData(rows);
  const worksheet = XLSX.utils.aoa_to_sheet(data);
  worksheet["!cols"] = [
    { wch: 14 },
    { wch: 18 },
    { wch: 14 },
    { wch: 14 },
    { wch: 18 },
    { wch: 12 },
    { wch: 30 },
  ];
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Inventario");
  return XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
}

function generatePdfBuffer(rows, titulo) {
  return new Promise((resolve, reject) => {
    // Configuración a TAMAÑO OFICIO (LEGAL) y orientación VERTICAL (portrait)
    const doc = new PDFDocument({
      margin: 40,
      size: "LEGAL",
      layout: "portrait",
    });

    const chunks = [];
    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    // --- 1. CABECERA Y LOGO (Diseño limpio y separado) ---
    // Posicionamos el logo arriba a la izquierda
    try {
      doc.image("../frontend/public/logo_cantv.png", 40, 35, { width: 85 });
    } catch (error) {
      console.warn(
        "Logo no encontrado. Asegúrate de colocar la ruta correcta.",
      );
    }

    // Dejamos un espacio vertical seguro antes de colocar el título para que nunca se encimen
    doc.y = 85;

    // Título principal con mejor presencia tipográfica y color institucional
    doc
      .font("Helvetica-Bold")
      .fontSize(14)
      .fillColor("#1e3a8a")
      .text(titulo, { align: "center" });
    doc.moveDown(0.2);

    // Subtítulo con fecha actual y un tono gris suave
    doc
      .font("Helvetica")
      .fontSize(8)
      .fillColor("#64748b")
      .text(`Generado el: ${new Date().toLocaleString("es-VE")}`, {
        align: "center",
      });
    doc.moveDown(0.8);

    // Línea divisoria decorativa sutil para separar la cabecera de la tabla
    doc
      .save()
      .strokeColor("#cbd5e1")
      .lineWidth(0.75)
      .moveTo(40, doc.y)
      .lineTo(doc.page.width - 40, doc.y)
      .stroke()
      .restore();

    doc.moveDown(1);

    if (rows.length === 0) {
      doc
        .font("Helvetica")
        .fontSize(10)
        .fillColor("#000")
        .text("No hay registros para exportar.", { align: "center" });
      doc.end();
      return;
    }

    // --- 2. CONFIGURACIÓN DE COLUMNAS Y CENTRADO ---
    const columns = [
      { header: "Tipo", key: "Tipo", width: 60 },
      { header: "Serial", key: "Serial", width: 90 },
      { header: "Marca", key: "Marca", width: 70 },
      { header: "Modelo", key: "Modelo", width: 80 },
      { header: "Ubicación", key: "Ubicación", width: 80 },
      { header: "Estado", key: "Estado", width: 52 },
      { header: "Observaciones", key: "Observaciones", width: 100 },
    ];

    const totalTableWidth = columns.reduce((sum, col) => sum + col.width, 0);
    const startX = (doc.page.width - totalTableWidth) / 2;
    const rowHeight = 22;
    let y = doc.y;

    // Función auxiliar para redibujar la cabecera de la tabla en páginas nuevas
    const drawTableHeader = (currentY) => {
      let x = startX;
      doc.fontSize(8.5).font("Helvetica-Bold");

      columns.forEach((col) => {
        doc.rect(x, currentY, col.width, rowHeight).fill("#1d4ed8"); // Azul corporativo más atractivo
        doc.fillColor("#ffffff").text(col.header, x, currentY + 7, {
          width: col.width,
          align: "center",
        });
        x += col.width;
      });
      return currentY + rowHeight;
    };

    // Dibujar primera cabecera de la tabla
    y = drawTableHeader(y);

    // --- 3. DIBUJADO DE FILAS ---
    doc.font("Helvetica");

    rows.forEach((row, index) => {
      // Salto de página automático manteniendo diseño
      if (y > doc.page.height - 50) {
        doc.addPage({ size: "LEGAL", layout: "portrait", margin: 40 });
        y = 50; // Margen superior en página nueva
        y = drawTableHeader(y);
      }

      // Filas con efecto cebra muy suave y estético
      const bgColor = index % 2 === 0 ? "#f8fafc" : "#ffffff";
      let x = startX;
      doc.fontSize(7.5);

      columns.forEach((col) => {
        doc.rect(x, y, col.width, rowHeight).fill(bgColor);
        doc
          .rect(x, y, col.width, rowHeight)
          .strokeColor("#f1f5f9")
          .lineWidth(0.5)
          .stroke();

        doc
          .fillColor("#334155")
          .text(String(row[col.key] ?? ""), x + 4, y + 6, {
            width: col.width - 8,
            align: col.key === "Observaciones" ? "left" : "center",
            ellipsis: true,
          });

        x += col.width;
      });

      y += rowHeight;
    });

    doc.end();
  });
}

Router.get("/export/tipos", verificarToken, async (req, res) => {
  try {
    const tipos = await fetchTiposFromDB();
    res.status(200).json(tipos);
  } catch (error) {
    res.status(500).json({
      message: "No se pudieron obtener los tipos de equipos.",
      error: error.message,
    });
  }
});

Router.get("/export/descargar", verificarToken, async (req, res) => {
  try {
    const { formato, tipo } = req.query;

    if (!formato || !["pdf", "excel"].includes(normalize(formato))) {
      return res.status(400).json({
        message: 'El parámetro "formato" debe ser "pdf" o "excel".',
      });
    }

    const inventario = await fetchInventario(req.user);
    const filtrado = filterInventario(inventario, req.query);
    const rows = toExportRows(filtrado);

    const tipoLabel =
      !tipo || normalize(tipo) === "completa" || normalize(tipo) === "completo"
        ? "Información completa"
        : tipo;

    const titulo = `Inventario — ${tipoLabel} (${rows.length} registros)`;
    const fileName = buildFileName(normalize(formato), tipo);

    if (normalize(formato) === "pdf") {
      const buffer = await generatePdfBuffer(rows, titulo);
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${fileName}"`,
      );
      return res.send(buffer);
    }

    const buffer = generateExcelBuffer(rows);
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
    return res.send(buffer);
  } catch (error) {
    console.error("Error en exportación:", error);
    res.status(500).json({
      message: "No se pudo generar el archivo de exportación.",
      error: error.message,
    });
  }
});

export default Router;
