import { db } from "../db/client";
import { debtsRepository } from "../repositories/debts.repository";
import { debtorRepository } from "../repositories/debtors.repository";
import { NotFoundError } from "../middlewares/errorHandler.middleware";
import { debts, paymentSchedules, historyEvents } from "../db/schema";

export const debtsService = {
  async list(userId: string) {
    return debtsRepository.findAllByUser(userId);
  },

  async getById(userId: string, id: string) {
    const debt = await debtsRepository.findByUserAndId(userId, id);
    if (!debt) throw new NotFoundError("Deuda");
    return debt;
  },

  async create(
    userId: string,
    data: {
      debtorId: string;
      totalAmount: string;
      currency?: string;
      dueDate?: string;
      paymentSchedule?: {
        frequency: string;
        installmentAmount?: string;
        installmentsCount?: number;
        customIntervalDays?: number;
      };
    }
  ) {
    const debtor = await debtorRepository.findByUserAndId(userId, data.debtorId);
    if (!debtor) throw new NotFoundError("Deudor");

    const debt = await db.transaction(async (tx) => {
      const [newDebt] = await tx
        .insert(debts)
        .values({
          debtorId: data.debtorId,
          totalAmount: data.totalAmount,
          remainingBalance: data.totalAmount,
          currency: data.currency || "COP",
          dueDate: data.dueDate || null,
        })
        .returning();

      if (data.paymentSchedule) {
        await tx.insert(paymentSchedules).values({
          debtId: newDebt.id,
          frequency: data.paymentSchedule.frequency as any,
          installmentAmount: data.paymentSchedule.installmentAmount,
          installmentsCount: data.paymentSchedule.installmentsCount,
          customIntervalDays: data.paymentSchedule.customIntervalDays,
        });
      }

      await tx.insert(historyEvents).values({
        userId,
        debtorId: data.debtorId,
        debtId: newDebt.id,
        eventType: "debt_created",
        description: `Deuda creada por $${data.totalAmount}`,
      });

      return newDebt;
    });

    return debt;
  },

  async update(
    userId: string,
    id: string,
    data: { totalAmount?: string; dueDate?: string | null; status?: string }
  ) {
    const existing = await debtsRepository.findByUserAndId(userId, id);
    if (!existing) throw new NotFoundError("Deuda");

    return debtsRepository.update(id, data as any);
  },

  async delete(userId: string, id: string) {
    const existing = await debtsRepository.findByUserAndId(userId, id);
    if (!existing) throw new NotFoundError("Deuda");
    return debtsRepository.delete(id);
  },

  async getOrderedByAge(userId: string) {
    return debtsRepository.getDebtsOrderedByAge(userId);
  },
};
