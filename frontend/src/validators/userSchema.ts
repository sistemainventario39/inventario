import {z} from "zod";
import {zodResolver} from "@hookform/resolvers/zod";
import {useForm} from "react-hook-form";

export const userScheme = z.object({
    cedula: z.string()
    .min(1, "La cédula es requerida").regex(/^[VE]-\d{7,8}$/i, "La cédula debe contener solo números"),

    email: z.string()
    .min(1, "El correo electrónico es requerido")
    .email("El correo electrónico no es válido"),
})