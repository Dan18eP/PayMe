import { z } from "zod";

export const registerPaymentSchema = z.object({
  debtId: z.string().uuid("ID de deuda inválido"),
  amount: z
    .string()
    .or(z.number())
    .transform((v) => String(v))
    .refine((v) => !isNaN(Number(v)) && Number(v) > 0, {
      message: "El monto debe ser un número positivo",
    }),
  isFullSettlement: z.boolean().default(false),
  notes: z.string().max(500).optional(),
});

export const paymentParamsSchema = z.object({
  id: z.string().uuid("ID de pago inválido"),
});

export type RegisterPaymentInput = z.infer<typeof registerPaymentSchema>;
