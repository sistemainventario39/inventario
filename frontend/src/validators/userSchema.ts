import { z } from "zod";

export const userSchema = z.object({
  cedula: z
    .string()
    .min(1, "La cédula es requerida")
    .regex(
      /^[VE]-\d{7,8}$/,
      "La cédula debe ser del formato V-12345678 o E-12345678",
    ),

  nombre: z
    .string()
    .min(1, "El nombre es requerido")
    .regex(/^[a-zA-Z\s]+$/, "El nombre solo puede contener letras y espacios"),

  apellido: z
    .string()
    .min(1, "El apellido es requerido")
    .regex(
      /^[a-zA-Z\s]+$/,
      "El apellido solo puede contener letras y espacios",
    ),

  email: z
    .string()
    .min(1, "El correo electrónico es requerido")
    .email("El correo electrónico no es válido"),

  telefono: z
    .string()
    .min(1, "El teléfono es requerido")
    .regex(
      /^(0414|0416|0424|0426|0412)\d{7}$/,
      "El teléfono debe contener solo números y comenzar con 0414, 0416, 0424, 0426 o 0412",
    ),

  usuario: z
    .string()
    .min(1, "El nombre de usuario es requerido")
    .min(4, "El nombre de usuario debe tener al menos 4 caracteres"),

  password: z.string().refine((value) => value === "" || value.length >= 6, {
    message: "La contraseña debe tener al menos 6 caracteres",
  }),

  rol: z.enum(
    ["Administrador", "Superadministrador", "Visualizador"],
    "debe seleccionar un rol",
  ),
  region: z.preprocess(
    (val) => (val === null || val === undefined ? "" : String(val)),
    z.string().min(1, "La región es requerida"),
  ),
  estado: z.preprocess(
    (val) => (val === null || val === undefined ? "" : String(val)),
    z.string().min(1, "El estado es requerido"),
  ),
  city: z.preprocess(
    (val) => (val === null || val === undefined ? "" : String(val)),
    z.string().min(1, "La ciudad es requerida"),
  ),
  sede: z.preprocess(
    (val) => (val === null || val === undefined ? "" : String(val)),
    z.string().min(1, "La sucursal es requerida"),
  ),
  piso: z.preprocess(
    (val) => (val === null || val === undefined ? "" : String(val)),
    z.string().min(1, "El piso es requerido"),
  ),
});

export type UserFormData = z.infer<typeof userSchema>;
