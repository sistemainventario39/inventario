import { z } from "zod";

export const editSchema = z.object({
  tipo: z.string().min(1, "El tipo de activo es requerido"),
  marca: z.string().min(1, "La marca es requerida"),
  modelo: z.string().min(1, "El modelo es requerido"),
  serial: z.string().min(1, "El serial es requerido"),
  estado: z.string().min(1, "Seleccione un estado físico"),
  notas: z.string().nullable().optional(),

  // Ubicación de Asignación (Campos planos del formulario)
  region: z.string().min(1, "Región requerida"),
  estado_ubicacion: z.string().min(1, "Estado requerido"),
  city: z.string().min(1, "Ciudad requerida"),
  sede: z.string().min(1, "Sede requerida"),
  piso: z.string().min(1, "Piso requerido"),
  ala: z.string().optional(),
});
