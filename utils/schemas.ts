import { z } from "zod";

/**
 * Transfer form schema (email and amount).
 * - Convert amount to number using z.coerce.number() so we can validate properly.
 * - Enforce a minimum positive amount (e.g. > 0).
 */
export const transferFormSchema = z.object({
  email: z.string().email({ message: "Ingresa un email válido." }),
  amount: z.coerce
    .number({
      invalid_type_error: "Debes ingresar un número para la cantidad.",
    })
    .positive("La cantidad debe ser mayor que 0."),
});

/**
 * Password form schema used to confirm the transaction.
 */
export const passwordFormSchema = z.object({
  password: z
    .string()
    .min(6, { message: "La contraseña debe tener al menos 6 caracteres." }),
});
