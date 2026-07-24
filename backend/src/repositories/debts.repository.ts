import { db } from "../db/client";
import { debts, debtors, paymentSchedules } from "../db/schema";
import { eq, and, asc, desc } from "drizzle-orm";

export const debtsRepository = {
  async findAllByUser(userId: string) {
    return db
      .select()
      .from(debts)
      .innerJoin(debtors, eq(debts.debtorId, debtors.id))
      .where(eq(debtors.userId, userId))
      .orderBy(desc(debts.createdAt));
  },

  async findById(id: string) {
    const rows = await db
      .select()
      .from(debts)
      .where(eq(debts.id, id))
      .limit(1);
    return rows[0] ?? null;
  },

  async findByUserAndId(userId: string, id: string) {
    const rows = await db
      .select()
      .from(debts)
      .innerJoin(debtors, eq(debts.debtorId, debtors.id))
      .where(and(eq(debts.id, id), eq(debtors.userId, userId)))
      .limit(1);
    return rows[0] ?? null;
  },

  async findAllByDebtor(debtorId: string) {
    return db
      .select()
      .from(debts)
      .where(eq(debts.debtorId, debtorId))
      .orderBy(desc(debts.createdAt));
  },

  async create(data: typeof debts.$inferInsert) {
    const rows = await db.insert(debts).values(data).returning();
    return rows[0];
  },

  async update(id: string, data: Partial<typeof debts.$inferInsert>) {
    const rows = await db
      .update(debts)
      .set(data)
      .where(eq(debts.id, id))
      .returning();
    return rows[0] ?? null;
  },

  async delete(id: string) {
    const rows = await db
      .delete(debts)
      .where(eq(debts.id, id))
      .returning();
    return rows[0] ?? null;
  },

  async getDebtsOrderedByAge(userId: string) {
    return db
      .select()
      .from(debts)
      .innerJoin(debtors, eq(debts.debtorId, debtors.id))
      .where(
        and(
          eq(debtors.userId, userId),
          eq(debts.status, "pending")
        )
      )
      .orderBy(asc(debts.createdAt));
  },

  async getPaymentSchedule(debtId: string) {
    const rows = await db
      .select()
      .from(paymentSchedules)
      .where(eq(paymentSchedules.debtId, debtId))
      .limit(1);
    return rows[0] ?? null;
  },

  async upsertPaymentSchedule(
    debtId: string,
    data: typeof paymentSchedules.$inferInsert
  ) {
    const existing = await this.getPaymentSchedule(debtId);
    if (existing) {
      const rows = await db
        .update(paymentSchedules)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(paymentSchedules.debtId, debtId))
        .returning();
      return rows[0];
    }
    const rows = await db.insert(paymentSchedules).values(data).returning();
    return rows[0];
  },
};
