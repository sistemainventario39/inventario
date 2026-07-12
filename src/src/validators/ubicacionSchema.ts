import { z } from "zod";

const requiredSelect = (label: string) =>
  z.preprocess(
    (val) => (val === null || val === undefined ? "" : String(val)),
    z.string().min(1, `${label} es requerido`),
  );

export const ubicacionSchema = z.object({
  region: requiredSelect("La región"),
  estado: requiredSelect("El estado"),
  ciudad: requiredSelect("La ciudad"),
  sede: z
    .string()
    .min(1, "La sede es requerida")
    .max(100, "La sede no puede superar 100 caracteres"),
  piso: z
    .string()
    .min(1, "El piso es requerido")
    .regex(/^\d+$/, "El piso debe ser un número entero positivo"),
  ala: z
    .union([
      z.literal(""),
      z.enum(["Este", "Oeste", "Norte", "Sur"], "Selecciona una ala válida"),
    ])
    .optional()
    .default(""),
});

export type UbicacionFormData = z.infer<typeof ubicacionSchema>;
