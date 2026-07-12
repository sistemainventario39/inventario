import { z } from "zod";

export const perifericoSchema = z.object({
  type: z.string().min(1, "El tipo de periférico es requerido"),

  name: z.string().min(1, "La marca es requerida"),

  model: z.string().min(1, "El modelo es requerido"),

  serial: z.string().min(1, "El serial es requerido"),

  status: z.string().min(1, "El estado es requerido"),

  // Ubicación (Asignación)
  region: z.preprocess(
    (val) => (val == null ? "" : String(val)),
    z.string().min(1, "La región es requerida"),
  ),

  estado: z.preprocess(
    (val) => (val == null ? "" : String(val)),
    z.string().min(1, "El estado es requerido"),
  ),

  city: z.preprocess(
    (val) => (val == null ? "" : String(val)),
    z.string().min(1, "La ciudad es requerida"),
  ),

  sede: z.preprocess(
    (val) => (val == null ? "" : String(val)),
    z.string().min(1, "La sede es requerida"),
  ),

  piso: z.preprocess(
    (val) => (val == null ? "" : String(val)),
    z.string().min(1, "El piso es requerido"),
  ),

  ala: z.preprocess(
    (val) => (val == null ? "" : String(val)),
    z.string().optional(),
  ),

  notas: z.string().optional(),

  asignadoA: z.string().optional(),
});
