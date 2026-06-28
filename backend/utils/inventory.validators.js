import {
  requireString,
  badRequest,
  normalize,
  sha1,
} from "../utils/inventory.helpers.js";
import { PERIFERICOS_MAP } from "../utils/inventory.constants.js";

export function normalizeLocationInput(input, label) {
  if (!input || typeof input !== "object") {
    throw badRequest(`La ubicación de ${label} es obligatoria.`);
  }

  const data = {};
  for (const field of locationRequiredFields) {
    data[field] = requireString(input[field], `${label}.${field}`);
  }

  data.ala = input.ala ? String(input.ala).trim() : null;
  return data;
}

export function locationIdFromData(data) {
  const raw = [
    normalize(data.region),
    normalize(data.estado),
    normalize(data.ciudad),
    normalize(data.sede),
    normalize(data.piso),
    normalize(data.ala || ""),
  ].join("|");

  return `ubi_${sha1(raw)}`;
}

export function serialIndexId(prefix, serial) {
  return `${prefix}_${sha1(normalize(serial))}`;
}

export function validatePayloadDuplicates(componentes, perifericos) {
  const serials = new Set();

  for (const item of [...componentes, ...perifericos]) {
    const serialNorm = normalize(item.serial);

    if (serials.has(serialNorm)) {
      throw badRequest(
        `El serial "${item.serial}" está repetido dentro del formulario.`,
      );
    }
    serials.add(serialNorm);
  }
}

export function validateEquipoBody(body) {
  const {
    marca,
    modelo,
    serial,
    estado,
    notas = null,
    procedencia,
    asignacion,
    componentes = [],
    perifericos = [],
  } = body;

  if (typeof marca !== "string" || !marca.trim()) {
    throw badRequest('El campo "marca" es obligatorio.');
  }

  if (typeof modelo !== "string" || !modelo.trim()) {
    throw badRequest('El campo "modelo" es obligatorio.');
  }

  requireString(serial, "serial");
  requireString(estado, "estado");

  if (!Array.isArray(componentes)) {
    throw badRequest('El campo "componentes" debe ser un arreglo.');
  }

  if (!Array.isArray(perifericos)) {
    throw badRequest('El campo "perifericos" debe ser un arreglo.');
  }

  normalizeLocationInput(procedencia, "procedencia");
  normalizeLocationInput(asignacion, "asignacion");

  return {
    marca: marca.trim(),
    modelo: modelo.trim(),
    serial: serial.trim(),
    estado: estado.trim(),
    notas: notas ? String(notas).trim() : null,
    procedencia,
    asignacion,
    componentes,
    perifericos,
  };
}

export function normalizeComponent(component, index) {
  if (!component || typeof component !== "object") {
    throw badRequest(`El componente #${index + 1} no es válido.`);
  }

  const tipoNorm = normalize(component.tipo);
  const tipoCorrecto = COMPONENTES_MAP[tipoNorm];

  if (!tipoCorrecto) {
    throw badRequest(
      `El componente #${index + 1} tiene un tipo inválido: ${component.tipo}`,
    );
  }

  const serial = requireString(
    component.serial,
    `componentes[${index}].serial`,
  );
  const estado = requireString(
    component.estado,
    `componentes[${index}].estado`,
  );

  const data = {
    tipo: tipoCorrecto,
    marca: component.marca ? String(component.marca).trim() : "Genérico",
    modelo: component.modelo ? String(component.modelo).trim() : "Genérico",
    serial,
    estado,
    notas: component.notas ? String(component.notas).trim() : null,
  };

  if (tipoCorrecto === "Memoria_RAM" || tipoCorrecto === "Disco_Duro") {
    if (!component.capacidad || !String(component.capacidad).trim()) {
      throw badRequest(
        `El componente "${tipoCorrecto}" requiere el campo "capacidad".`,
      );
    }
    data.capacidad = String(component.capacidad).trim();
  }

  return data;
}

export function normalizePeriferico(periferico, index) {
  if (!periferico || typeof periferico !== "object") {
    throw badRequest(`El periférico #${index + 1} no es válido.`);
  }

  const tipoNorm = normalize(periferico.tipo);
  const tipoCorrecto = PERIFERICOS_MAP[tipoNorm];

  if (!tipoCorrecto) {
    throw badRequest(
      `El periférico #${index + 1} tiene un tipo inválido: ${periferico.tipo}`,
    );
  }

  const serial = requireString(
    periferico.serial,
    `perifericos[${index}].serial`,
  );
  const estado = requireString(
    periferico.estado,
    `perifericos[${index}].estado`,
  );

  return {
    tipo: tipoCorrecto,
    marca: periferico.marca ? String(periferico.marca).trim() : "Genérico",
    modelo: periferico.modelo ? String(periferico.modelo).trim() : "Genérico",
    serial,
    estado,
    notas: periferico.notas ? String(periferico.notas).trim() : null,
  };
}
