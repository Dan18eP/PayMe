import { db } from "../db/client";
import { debtors } from "../db/schema";
import { eq, and, like, asc } from "drizzle-orm";

export const debtorRepository = {
  async findAllByUser(userId: string) {
    return db
      .select()
      .from(debtors)
      .where(eq(debtors.userId, userId))
      .orderBy(asc(debtors.fullName));
  },

  async findById(id: string) {
    const rows = await db
      .select()
      .from(debtors)
      .where(eq(debtors.id, id))
      .limit(1);
    return rows[0] ?? null;
  },

  async findByUserAndId(userId: string, id: string) {
    const rows = await db
      .select()
      .from(debtors)
      .where(and(eq(debtors.id, id), eq(debtors.userId, userId)))
      .limit(1);
    return rows[0] ?? null;
  },

  async create(data: typeof debtors.$inferInsert) {
    const rows = await db.insert(debtors).values(data).returning();
    return rows[0];
  },

  async update(id: string, data: Partial<typeof debtors.$inferInsert>) {
    const rows = await db
      .update(debtors)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(debtors.id, id))
      .returning();
    return rows[0] ?? null;
  },

  async delete(id: string) {
    const rows = await db
      .delete(debtors)
      .where(eq(debtors.id, id))
      .returning();
    return rows[0] ?? null;
  },

  async searchByUser(userId: string, query: string) {
    return db
      .select()
      .from(debtors)
      .where(
        and(
          eq(debtors.userId, userId),
          like(debtors.fullName, `%${query}%`)
        )
      )
      .orderBy(asc(debtors.fullName));
  },
};
