import { db } from "../db/client";
import { userSettings } from "../db/schema";
import { eq } from "drizzle-orm";

export const settingsRepository = {
  async findByUser(userId: string) {
    const rows = await db
      .select()
      .from(userSettings)
      .where(eq(userSettings.userId, userId))
      .limit(1);
    return rows[0] ?? null;
  },

  async upsert(userId: string, data: Partial<typeof userSettings.$inferInsert>) {
    const existing = await this.findByUser(userId);
    if (existing) {
      const rows = await db
        .update(userSettings)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(userSettings.userId, userId))
        .returning();
      return rows[0];
    }
    const rows = await db
      .insert(userSettings)
      .values({ userId, ...data })
      .returning();
    return rows[0];
  },
};
