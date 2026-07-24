import { z } from "zod";

export const generateAgreementSchema = z.object({
  debtId: z.string().uuid("ID de deuda inválido"),
  content: z.string().min(10, "El contenido del acuerdo es muy corto").optional(),
});

export const signAgreementSchema = z.object({
  token: z.string().min(1, "Token requerido"),
  signerName: z.string().min(2, "El nombre es requerido").max(150),
  signatureImage: z.string().optional(),
});

export const agreementParamsSchema = z.object({
  id: z.string().uuid("ID de acuerdo inválido"),
});

export type GenerateAgreementInput = z.infer<typeof generateAgreementSchema>;
export type SignAgreementInput = z.infer<typeof signAgreementSchema>;
