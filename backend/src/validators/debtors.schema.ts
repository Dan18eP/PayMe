import { z } from "zod";

export const createDebtorSchema = z.object({
  fullName: z
    .string()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(150, "El nombre no puede exceder 150 caracteres"),
  phone: z
    .string()
    .regex(/^\+?\d{7,15}$/, "Teléfono inválido. Debe ser formato internacional (ej. +573001234567)"),
  notes: z.string().max(500).optional(),
});

export const updateDebtorSchema = z.object({
  fullName: z.string().min(2).max(150).optional(),
  phone: z
    .string()
    .regex(/^\+?\d{7,15}$/, "Teléfono inválido")
    .optional(),
  notes: z.string().max(500).optional(),
});

export const debtorParamsSchema = z.object({
  id: z.string().uuid("ID de deudor inválido"),
});

export type CreateDebtorInput = z.infer<typeof createDebtorSchema>;
export type UpdateDebtorInput = z.infer<typeof updateDebtorSchema>;
