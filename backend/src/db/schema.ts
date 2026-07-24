import {
  pgTable,
  uuid,
  varchar,
  text,
  numeric,
  timestamp,
  date,
  pgEnum,
  integer,
  boolean,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const debtStatusEnum = pgEnum("debt_status", [
  "pending",
  "partially_paid",
  "paid",
  "cancelled",
]);

export const paymentFrequencyEnum = pgEnum("payment_frequency", [
  "one_time",
  "daily",
  "weekly",
  "biweekly",
  "monthly",
  "custom",
]);

export const historyEventTypeEnum = pgEnum("history_event_type", [
  "debt_created",
  "payment_registered",
  "debt_closed",
  "reminder_sent",
  "agreement_generated",
  "agreement_signed",
]);

export const reminderChannelEnum = pgEnum("reminder_channel", [
  "whatsapp",
  "email",
  "in_app",
]);

export const agreementStatusEnum = pgEnum("agreement_status", [
  "pending",
  "signed",
  "expired",
]);

export const debtors = pgTable(
  "debtors",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id").notNull(),
    fullName: varchar("full_name", { length: 150 }).notNull(),
    phone: varchar("phone", { length: 20 }).notNull(),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    userIdx: index("debtors_user_id_idx").on(table.userId),
    userPhoneUniqueIdx: uniqueIndex("debtors_user_phone_unique_idx").on(table.userId, table.phone),
    userNameIdx: index("debtors_user_full_name_idx").on(table.userId, table.fullName),
  })
);

export const debts = pgTable(
  "debts",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    debtorId: uuid("debtor_id")
      .notNull()
      .references(() => debtors.id, { onDelete: "cascade" }),
    totalAmount: numeric("total_amount", { precision: 12, scale: 2 }).notNull(),
    remainingBalance: numeric("remaining_balance", { precision: 12, scale: 2 }).notNull(),
    currency: varchar("currency", { length: 3 }).default("COP").notNull(),
    status: debtStatusEnum("status").default("pending").notNull(),
    dueDate: date("due_date"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    closedAt: timestamp("closed_at", { withTimezone: true }),
  },
  (table) => ({
    debtorIdx: index("debts_debtor_id_idx").on(table.debtorId),
    statusIdx: index("debts_status_idx").on(table.status),
    debtorStatusIdx: index("debts_debtor_status_idx").on(table.debtorId, table.status),
    dueDateIdx: index("debts_due_date_idx").on(table.dueDate),
    createdAtIdx: index("debts_created_at_idx").on(table.createdAt),
  })
);

export const paymentSchedules = pgTable(
  "payment_schedules",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    debtId: uuid("debt_id")
      .notNull()
      .references(() => debts.id, { onDelete: "cascade" })
      .unique(),
    frequency: paymentFrequencyEnum("frequency").notNull(),
    installmentAmount: numeric("installment_amount", { precision: 12, scale: 2 }),
    installmentsCount: integer("installments_count"),
    customIntervalDays: integer("custom_interval_days"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    debtUniqueIdx: uniqueIndex("payment_schedules_debt_id_unique_idx").on(table.debtId),
    frequencyIdx: index("payment_schedules_frequency_idx").on(table.frequency),
  })
);

export const payments = pgTable(
  "payments",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    debtId: uuid("debt_id")
      .notNull()
      .references(() => debts.id, { onDelete: "cascade" }),
    amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
    paidAt: timestamp("paid_at", { withTimezone: true }).defaultNow().notNull(),
    isFullSettlement: boolean("is_full_settlement").default(false).notNull(),
    notes: text("notes"),
  },
  (table) => ({
    debtIdx: index("payments_debt_id_idx").on(table.debtId),
    paidAtIdx: index("payments_paid_at_idx").on(table.paidAt),
    debtPaidAtIdx: index("payments_debt_paid_at_idx").on(table.debtId, table.paidAt),
  })
);

export const historyEvents = pgTable(
  "history_events",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id").notNull(),
    debtorId: uuid("debtor_id").references(() => debtors.id, { onDelete: "set null" }),
    debtId: uuid("debt_id").references(() => debts.id, { onDelete: "set null" }),
    paymentId: uuid("payment_id").references(() => payments.id, { onDelete: "set null" }),
    eventType: historyEventTypeEnum("event_type").notNull(),
    description: text("description").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    userIdx: index("history_events_user_id_idx").on(table.userId),
    debtIdx: index("history_events_debt_id_idx").on(table.debtId),
    paymentIdx: index("history_events_payment_id_idx").on(table.paymentId),
    userCreatedAtIdx: index("history_events_user_created_at_idx").on(table.userId, table.createdAt),
    eventTypeIdx: index("history_events_event_type_idx").on(table.eventType),
  })
);

export const remindersLog = pgTable(
  "reminders_log",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    debtId: uuid("debt_id")
      .notNull()
      .references(() => debts.id, { onDelete: "cascade" }),
    channel: reminderChannelEnum("channel").notNull(),
    messageContent: text("message_content").notNull(),
    sentAt: timestamp("sent_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    debtIdx: index("reminders_log_debt_id_idx").on(table.debtId),
    sentAtIdx: index("reminders_log_sent_at_idx").on(table.sentAt),
    debtSentAtIdx: index("reminders_log_debt_sent_at_idx").on(table.debtId, table.sentAt),
  })
);

export const agreements = pgTable(
  "agreements",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    debtId: uuid("debt_id")
      .notNull()
      .references(() => debts.id, { onDelete: "cascade" })
      .unique(),
    content: text("content").notNull(),
    signatureToken: varchar("signature_token", { length: 255 }).unique(),
    tokenExpiresAt: timestamp("token_expires_at", { withTimezone: true }),
    status: agreementStatusEnum("status").default("pending").notNull(),
    signatureImageUrl: text("signature_image_url"),
    signedAt: timestamp("signed_at", { withTimezone: true }),
    signerIp: varchar("signer_ip", { length: 45 }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    debtUniqueIdx: uniqueIndex("agreements_debt_id_unique_idx").on(table.debtId),
    signatureTokenUniqueIdx: uniqueIndex("agreements_signature_token_unique_idx").on(table.signatureToken),
    statusIdx: index("agreements_status_idx").on(table.status),
    tokenExpiresAtIdx: index("agreements_token_expires_at_idx").on(table.tokenExpiresAt),
  })
);

export const userSettings = pgTable("user_settings", {
  userId: uuid("user_id").primaryKey(),
  whatsappNumber: varchar("whatsapp_number", { length: 20 }),
  fullName: varchar("full_name", { length: 150 }),
  reminderTemplate: text("reminder_template"),
  agreementTemplate: text("agreement_template"),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const debtorsRelations = relations(debtors, ({ many }) => ({
  debts: many(debts),
  historyEvents: many(historyEvents),
}));

export const debtsRelations = relations(debts, ({ one, many }) => ({
  debtor: one(debtors, { fields: [debts.debtorId], references: [debtors.id] }),
  paymentSchedule: one(paymentSchedules, {
    fields: [debts.id],
    references: [paymentSchedules.debtId],
  }),
  payments: many(payments),
  historyEvents: many(historyEvents),
  remindersLog: many(remindersLog),
  agreement: one(agreements, { fields: [debts.id], references: [agreements.debtId] }),
}));

export const paymentSchedulesRelations = relations(paymentSchedules, ({ one }) => ({
  debt: one(debts, { fields: [paymentSchedules.debtId], references: [debts.id] }),
}));

export const paymentsRelations = relations(payments, ({ one, many }) => ({
  debt: one(debts, { fields: [payments.debtId], references: [debts.id] }),
  historyEvents: many(historyEvents),
}));

export const historyEventsRelations = relations(historyEvents, ({ one }) => ({
  debtor: one(debtors, { fields: [historyEvents.debtorId], references: [debtors.id] }),
  debt: one(debts, { fields: [historyEvents.debtId], references: [debts.id] }),
  payment: one(payments, { fields: [historyEvents.paymentId], references: [payments.id] }),
}));

export const remindersLogRelations = relations(remindersLog, ({ one }) => ({
  debt: one(debts, { fields: [remindersLog.debtId], references: [debts.id] }),
}));

export const agreementsRelations = relations(agreements, ({ one }) => ({
  debt: one(debts, { fields: [agreements.debtId], references: [debts.id] }),
}));
