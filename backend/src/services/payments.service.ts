import { db } from "../db/client";
import { debts, payments, historyEvents } from "../db/schema";
import { eq } from "drizzle-orm";
import { debtsRepository } from "../repositories/debts.repository";
import { paymentsRepository } from "../repositories/payments.repository";
import {
  NotFoundError,
  InsufficientBalanceError,
} from "../middlewares/errorHandler.middleware";

export const paymentsService = {
  async register(
    userId: string,
    data: {
      debtId: string;
      amount: string;
      isFullSettlement?: boolean;
      notes?: string;
    }
  ) {
    const debt = await debtsRepository.findByUserAndId(userId, data.debtId);
    if (!debt) throw new NotFoundError("Deuda");

    const remaining = Number(debt.debts.remainingBalance);
    const amount = Number(data.amount);

    if (amount > remaining) {
      throw new InsufficientBalanceError();
    }

    const newBalance = (remaining - amount).toFixed(2);
    const isFullSettlement = data.isFullSettlement || newBalance === "0.00";
    const newStatus = isFullSettlement ? "paid" : "partially_paid";

    const result = await db.transaction(async (tx) => {
      const [payment] = await tx
        .insert(payments)
        .values({
          debtId: data.debtId,
          amount: data.amount,
          isFullSettlement,
          notes: data.notes,
        })
        .returning();

      await tx
        .update(debts)
        .set({
          remainingBalance: newBalance,
          status: newStatus,
          closedAt: isFullSettlement ? new Date() : null,
        })
        .where(eq(debts.id, data.debtId));

      await tx.insert(historyEvents).values({
        userId,
        debtorId: debt.debtors?.id || null,
        debtId: data.debtId,
        paymentId: payment.id,
        eventType: "payment_registered",
        description: isFullSettlement
          ? `Pago total de $${data.amount} registrado`
          : `Abono de $${data.amount} registrado. Saldo pendiente: $${newBalance}`,
      });

      if (isFullSettlement) {
        await tx.insert(historyEvents).values({
          userId,
          debtorId: debt.debtors?.id || null,
          debtId: data.debtId,
          eventType: "debt_closed",
          description: `Deuda cerrada tras pago total. Monto final: $${data.amount}`,
        });
      }

      return payment;
    });

    return result;
  },

  async getByDebt(userId: string, debtId: string) {
    const debt = await debtsRepository.findByUserAndId(userId, debtId);
    if (!debt) throw new NotFoundError("Deuda");
    return paymentsRepository.findByDebt(debtId);
  },
};
