import { db } from "../db/client";
import { debts, debtors } from "../db/schema";
import { eq, sql, and, inArray } from "drizzle-orm";

export const dashboardService = {
  async getSummary(userId: string) {
    const debtorList = await db
      .select({ id: debtors.id })
      .from(debtors)
      .where(eq(debtors.userId, userId));

    const debtorIds = debtorList.map((d) => d.id);

    if (debtorIds.length === 0) {
      return {
        totalDebt: "0",
        activeDebtors: 0,
        pendingDebts: 0,
        totalPaid: "0",
        overdueDebts: 0,
      };
    }

    const debtStats = await db
      .select({
        totalRemaining: sql`COALESCE(SUM(CAST(remaining_balance AS numeric)), 0)`.as<string>(),
        activeDebts: sql`COUNT(*)`.as<number>(),
        paidDebts: sql`SUM(CASE WHEN status = 'paid' THEN 1 ELSE 0 END)`.as<number>(),
        overdue: sql`SUM(CASE WHEN due_date IS NOT NULL AND due_date < CURRENT_DATE AND status != 'paid' THEN 1 ELSE 0 END)`.as<number>(),
      })
      .from(debts)
      .where(inArray(debts.debtorId, debtorIds));

    const stats = debtStats[0];

    return {
      totalDebt: String(stats?.totalRemaining || "0"),
      activeDebtors: debtorIds.length,
      pendingDebts: Number(stats?.activeDebts || 0) - Number(stats?.paidDebts || 0),
      totalPaid: "0",
      overdueDebts: Number(stats?.overdue || 0),
    };
  },

  async getDebtorsBySeniority(userId: string) {
    return db
      .select({
        id: debtors.id,
        fullName: debtors.fullName,
        phone: debtors.phone,
        debtId: debts.id,
        totalAmount: debts.totalAmount,
        remainingBalance: debts.remainingBalance,
        status: debts.status,
        createdAt: debts.createdAt,
        dueDate: debts.dueDate,
      })
      .from(debtors)
      .innerJoin(debts, eq(debts.debtorId, debtors.id))
      .where(
        and(
          eq(debtors.userId, userId),
          inArray(debts.status, ["pending", "partially_paid"])
        )
      )
      .orderBy(sql`EXTRACT(EPOCH FROM ${debts.createdAt}) ASC`);
  },
};
