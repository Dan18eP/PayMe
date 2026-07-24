import { agreementsRepository } from "../repositories/agreements.repository";
import { debtsRepository } from "../repositories/debts.repository";
import { debtorRepository } from "../repositories/debtors.repository";
import { historyRepository } from "../repositories/history.repository";
import {
  NotFoundError,
  AppError,
} from "../middlewares/errorHandler.middleware";
import {
  generateSignatureToken,
  getTokenExpiration,
} from "../utils/signatureToken.util";

export const agreementsService = {
  async generate(
    userId: string,
    data: { debtId: string; content?: string }
  ) {
    const debt = await debtsRepository.findByUserAndId(userId, data.debtId);
    if (!debt) throw new NotFoundError("Deuda");

    const debtor = await debtorRepository.findById(debt.debts.debtorId);
    if (!debtor) throw new NotFoundError("Deudor");

    const defaultContent = `ACUERDO DE COMPROMISO DE PAGO\n\nEntre ${debtor.fullName} (el deudor) y el usuario de la plataforma PayMe!.\n\nMonto total: $${debt.debts.totalAmount}\nSaldo pendiente: $${debt.debts.remainingBalance}\nFecha del acuerdo: ${new Date().toLocaleDateString("es-CO")}\n\nEl deudor se compromete a pagar el monto total acordado en los términos establecidos.`;

    const token = generateSignatureToken();
    const tokenExpiresAt = getTokenExpiration(48);

    const agreement = await agreementsRepository.create({
      debtId: data.debtId,
      content: data.content || defaultContent,
      signatureToken: token,
      tokenExpiresAt,
    });

    await historyRepository.create({
      userId,
      debtorId: debtor.id,
      debtId: data.debtId,
      eventType: "agreement_generated",
      description: `Acuerdo de compromiso generado para ${debtor.fullName}`,
    });

    return agreement;
  },

  async sign(token: string, signerName: string, signatureImage?: string) {
    const agreement = await agreementsRepository.findByToken(token);
    if (!agreement) throw new NotFoundError("Acuerdo");
    if (agreement.status !== "pending") {
      throw new AppError("El acuerdo ya fue firmado o expiró", 400);
    }
    if (agreement.tokenExpiresAt && new Date() > agreement.tokenExpiresAt) {
      throw new AppError("El token de firma ha expirado", 410);
    }

    const updated = await agreementsRepository.update(agreement.id, {
      status: "signed",
      signatureImageUrl: signatureImage,
      signedAt: new Date(),
    });

    await historyRepository.create({
      userId: "",
      debtorId: null,
      debtId: agreement.debtId,
      eventType: "agreement_signed",
      description: `Acuerdo firmado por ${signerName}`,
    });

    return updated;
  },

  async getByDebt(userId: string, debtId: string) {
    const debt = await debtsRepository.findByUserAndId(userId, debtId);
    if (!debt) throw new NotFoundError("Deuda");
    return agreementsRepository.findByDebt(debtId);
  },

  async getPublicByToken(token: string) {
    const agreement = await agreementsRepository.findByToken(token);
    if (!agreement) throw new NotFoundError("Acuerdo");
    return {
      id: agreement.id,
      content: agreement.content,
      status: agreement.status,
      signedAt: agreement.signedAt,
      tokenExpiresAt: agreement.tokenExpiresAt,
    };
  },
};
