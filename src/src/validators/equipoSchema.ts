import { z } from "zod";

export const equipoSchema = z.object({
  type: z.string().min(1, "El tipo de equipo es requerido"),
  name: z.string().min(1, "La marca es requerida"),
  model: z.string().min(1, "El modelo es requerido"),
  serial: z.string().min(1, "El serial del equipo principal es requerido"),
  status: z.string().min(1, "El estado es requerido"),

  // Ubicaciones (Procedencia y Asignación)
  regionP: z.preprocess(
    (val) => (val === null || val === undefined ? "" : String(val)),
    z.string().min(1, "Región de procedencia requerida"),
  ),
  estadoP: z.preprocess(
    (val) => (val === null || val === undefined ? "" : String(val)),
    z.string().min(1, "Estado de procedencia requerido"),
  ),
  cityP: z.preprocess(
    (val) => (val === null || val === undefined ? "" : String(val)),
    z.string().min(1, "Ciudad de procedencia requerida"),
  ),
  sedeP: z.preprocess(
    (val) => (val === null || val === undefined ? "" : String(val)),
    z.string().min(1, "Sede de procedencia requerida"),
  ),
  pisoP: z.preprocess(
    (val) => (val === null || val === undefined ? "" : String(val)),
    z.string().min(1, "Piso de procedencia requerido"),
  ),

  region: z.preprocess(
    (val) => (val === null || val === undefined ? "" : String(val)),
    z.string().min(1, "Región de asignación requerida"),
  ),
  estado: z.preprocess(
    (val) => (val === null || val === undefined ? "" : String(val)),
    z.string().min(1, "Estado de asignación requerido"),
  ),
  city: z.preprocess(
    (val) => (val === null || val === undefined ? "" : String(val)),
    z.string().min(1, "Ciudad de asignación requerida"),
  ),
  sede: z.preprocess(
    (val) => (val === null || val === undefined ? "" : String(val)),
    z.string().min(1, "Sede de asignación requerida"),
  ),
  piso: z.preprocess(
    (val) => (val === null || val === undefined ? "" : String(val)),
    z.string().min(1, "Piso de asignación requerido"),
  ),
});
