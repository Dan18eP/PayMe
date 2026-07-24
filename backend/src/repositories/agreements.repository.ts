import { db } from "../db/client";
import { agreements } from "../db/schema";
import { eq } from "drizzle-orm";

export const agreementsRepository = {
  async findByDebt(debtId: string) {
    const rows = await db
      .select()
      .from(agreements)
      .where(eq(agreements.debtId, debtId))
      .limit(1);
    return rows[0] ?? null;
  },

  async findById(id: string) {
    const rows = await db
      .select()
      .from(agreements)
      .where(eq(agreements.id, id))
      .limit(1);
    return rows[0] ?? null;
  },

  async findByToken(token: string) {
    const rows = await db
      .select()
      .from(agreements)
      .where(eq(agreements.signatureToken, token))
      .limit(1);
    return rows[0] ?? null;
  },

  async create(data: typeof agreements.$inferInsert) {
    const rows = await db.insert(agreements).values(data).returning();
    return rows[0];
  },

  async update(id: string, data: Partial<typeof agreements.$inferInsert>) {
    const rows = await db
      .update(agreements)
      .set(data)
      .where(eq(agreements.id, id))
      .returning();
    return rows[0] ?? null;
  },
};
