import { z } from "zod";

export const createDebtSchema = z.object({
  debtorId: z.string().uuid("ID de deudor inválido"),
  totalAmount: z
    .string()
    .or(z.number())
    .transform((v) => String(v))
    .refine((v) => !isNaN(Number(v)) && Number(v) > 0, {
      message: "El monto debe ser un número positivo",
    }),
  currency: z.string().length(3).default("COP"),
  dueDate: z.string().date("Fecha inválida (formato YYYY-MM-DD)").optional(),
  paymentSchedule: z
    .object({
      frequency: z.enum(["one_time", "daily", "weekly", "biweekly", "monthly", "custom"]),
      installmentAmount: z.string().or(z.number()).transform((v) => String(v)).optional(),
      installmentsCount: z.number().int().positive().optional(),
      customIntervalDays: z.number().int().positive().optional(),
    })
    .optional(),
});

export const updateDebtSchema = z.object({
  totalAmount: z.string().or(z.number()).transform((v) => String(v)).optional(),
  dueDate: z.string().date().optional().nullable(),
  status: z.enum(["pending", "partially_paid", "paid", "cancelled"]).optional(),
});

export const debtParamsSchema = z.object({
  id: z.string().uuid("ID de deuda inválido"),
});

export type CreateDebtInput = z.infer<typeof createDebtSchema>;
export type UpdateDebtInput = z.infer<typeof updateDebtSchema>;
