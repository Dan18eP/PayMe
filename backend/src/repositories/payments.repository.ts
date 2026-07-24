import { db } from "../db/client";
import { payments } from "../db/schema";
import { eq, asc } from "drizzle-orm";

export const paymentsRepository = {
  async findByDebt(debtId: string) {
    return db
      .select()
      .from(payments)
      .where(eq(payments.debtId, debtId))
      .orderBy(asc(payments.paidAt));
  },

  async findById(id: string) {
    const rows = await db
      .select()
      .from(payments)
      .where(eq(payments.id, id))
      .limit(1);
    return rows[0] ?? null;
  },

  async create(data: typeof payments.$inferInsert) {
    const rows = await db.insert(payments).values(data).returning();
    return rows[0];
  },
};
