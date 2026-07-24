import { debtsRepository } from "../repositories/debts.repository";
import { debtorRepository } from "../repositories/debtors.repository";
import { NotFoundError } from "../middlewares/errorHandler.middleware";
import {
  generateWhatsAppLink,
  buildReminderMessage,
} from "../utils/whatsappLink.util";
import { daysSince } from "../utils/dateHelpers.util";

export const remindersService = {
  async generateWhatsAppLink(
    userId: string,
    debtId: string,
    customMessage?: string
  ) {
    const debt = await debtsRepository.findByUserAndId(userId, debtId);
    if (!debt) throw new NotFoundError("Deuda");

    const debtor = await debtorRepository.findById(debt.debts.debtorId);
    if (!debtor) throw new NotFoundError("Deudor");

    const daysOverdue = debt.debts.dueDate
      ? daysSince(new Date(debt.debts.dueDate))
      : undefined;

    const message =
      customMessage ||
      buildReminderMessage(
        debtor.fullName,
        debt.debts.remainingBalance,
        daysOverdue && daysOverdue > 0 ? daysOverdue : undefined
      );

    return {
      phone: debtor.phone,
      waLink: generateWhatsAppLink(debtor.phone, message),
      message,
      debtorName: debtor.fullName,
    };
  },
};
