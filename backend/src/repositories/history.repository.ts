import { db } from "../db/client";
import { historyEvents } from "../db/schema";
import { eq, and, desc, between } from "drizzle-orm";

export const historyRepository = {
  async findByUser(
    userId: string,
    filters?: {
      eventType?: string;
      startDate?: string;
      endDate?: string;
    }
  ) {
    const conditions = [eq(historyEvents.userId, userId)];

    if (filters?.eventType) {
      conditions.push(eq(historyEvents.eventType, filters.eventType as any));
    }
    if (filters?.startDate && filters?.endDate) {
      conditions.push(
        between(
          historyEvents.createdAt,
          new Date(filters.startDate),
          new Date(filters.endDate)
        )
      );
    }

    return db
      .select()
      .from(historyEvents)
      .where(and(...conditions))
      .orderBy(desc(historyEvents.createdAt));
  },

  async findByDebtor(debtorId: string) {
    return db
      .select()
      .from(historyEvents)
      .where(eq(historyEvents.debtorId, debtorId))
      .orderBy(desc(historyEvents.createdAt));
  },

  async findByDebt(debtId: string) {
    return db
      .select()
      .from(historyEvents)
      .where(eq(historyEvents.debtId, debtId))
      .orderBy(desc(historyEvents.createdAt));
  },

  async create(data: typeof historyEvents.$inferInsert) {
    const rows = await db.insert(historyEvents).values(data).returning();
    return rows[0];
  },
};
