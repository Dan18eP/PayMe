CREATE TYPE "public"."agreement_status" AS ENUM('pending', 'signed', 'expired');--> statement-breakpoint
CREATE TYPE "public"."debt_status" AS ENUM('pending', 'partially_paid', 'paid', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."history_event_type" AS ENUM('debt_created', 'payment_registered', 'debt_closed', 'reminder_sent', 'agreement_generated', 'agreement_signed');--> statement-breakpoint
CREATE TYPE "public"."payment_frequency" AS ENUM('one_time', 'daily', 'weekly', 'biweekly', 'monthly', 'custom');--> statement-breakpoint
CREATE TYPE "public"."reminder_channel" AS ENUM('whatsapp', 'email', 'in_app');--> statement-breakpoint
CREATE TABLE "agreements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"debt_id" uuid NOT NULL,
	"content" text NOT NULL,
	"signature_token" varchar(255),
	"token_expires_at" timestamp with time zone,
	"status" "agreement_status" DEFAULT 'pending' NOT NULL,
	"signature_image_url" text,
	"signed_at" timestamp with time zone,
	"signer_ip" varchar(45),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "agreements_debt_id_unique" UNIQUE("debt_id"),
	CONSTRAINT "agreements_signature_token_unique" UNIQUE("signature_token")
);
--> statement-breakpoint
CREATE TABLE "debtors" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"full_name" varchar(150) NOT NULL,
	"phone" varchar(20) NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "debts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"debtor_id" uuid NOT NULL,
	"total_amount" numeric(12, 2) NOT NULL,
	"remaining_balance" numeric(12, 2) NOT NULL,
	"currency" varchar(3) DEFAULT 'COP' NOT NULL,
	"status" "debt_status" DEFAULT 'pending' NOT NULL,
	"due_date" date,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"closed_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "history_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"debtor_id" uuid,
	"debt_id" uuid,
	"payment_id" uuid,
	"event_type" "history_event_type" NOT NULL,
	"description" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payment_schedules" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"debt_id" uuid NOT NULL,
	"frequency" "payment_frequency" NOT NULL,
	"installment_amount" numeric(12, 2),
	"installments_count" integer,
	"custom_interval_days" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "payment_schedules_debt_id_unique" UNIQUE("debt_id")
);
--> statement-breakpoint
CREATE TABLE "payments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"debt_id" uuid NOT NULL,
	"amount" numeric(12, 2) NOT NULL,
	"paid_at" timestamp with time zone DEFAULT now() NOT NULL,
	"is_full_settlement" boolean DEFAULT false NOT NULL,
	"notes" text
);
--> statement-breakpoint
CREATE TABLE "reminders_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"debt_id" uuid NOT NULL,
	"channel" "reminder_channel" NOT NULL,
	"message_content" text NOT NULL,
	"sent_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "agreements" ADD CONSTRAINT "agreements_debt_id_debts_id_fk" FOREIGN KEY ("debt_id") REFERENCES "public"."debts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "debts" ADD CONSTRAINT "debts_debtor_id_debtors_id_fk" FOREIGN KEY ("debtor_id") REFERENCES "public"."debtors"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "history_events" ADD CONSTRAINT "history_events_debtor_id_debtors_id_fk" FOREIGN KEY ("debtor_id") REFERENCES "public"."debtors"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "history_events" ADD CONSTRAINT "history_events_debt_id_debts_id_fk" FOREIGN KEY ("debt_id") REFERENCES "public"."debts"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "history_events" ADD CONSTRAINT "history_events_payment_id_payments_id_fk" FOREIGN KEY ("payment_id") REFERENCES "public"."payments"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment_schedules" ADD CONSTRAINT "payment_schedules_debt_id_debts_id_fk" FOREIGN KEY ("debt_id") REFERENCES "public"."debts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_debt_id_debts_id_fk" FOREIGN KEY ("debt_id") REFERENCES "public"."debts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reminders_log" ADD CONSTRAINT "reminders_log_debt_id_debts_id_fk" FOREIGN KEY ("debt_id") REFERENCES "public"."debts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "agreements_debt_id_unique_idx" ON "agreements" USING btree ("debt_id");--> statement-breakpoint
CREATE UNIQUE INDEX "agreements_signature_token_unique_idx" ON "agreements" USING btree ("signature_token");--> statement-breakpoint
CREATE INDEX "agreements_status_idx" ON "agreements" USING btree ("status");--> statement-breakpoint
CREATE INDEX "agreements_token_expires_at_idx" ON "agreements" USING btree ("token_expires_at");--> statement-breakpoint
CREATE INDEX "debtors_user_id_idx" ON "debtors" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "debtors_user_phone_unique_idx" ON "debtors" USING btree ("user_id","phone");--> statement-breakpoint
CREATE INDEX "debtors_user_full_name_idx" ON "debtors" USING btree ("user_id","full_name");--> statement-breakpoint
CREATE INDEX "debts_debtor_id_idx" ON "debts" USING btree ("debtor_id");--> statement-breakpoint
CREATE INDEX "debts_status_idx" ON "debts" USING btree ("status");--> statement-breakpoint
CREATE INDEX "debts_debtor_status_idx" ON "debts" USING btree ("debtor_id","status");--> statement-breakpoint
CREATE INDEX "debts_due_date_idx" ON "debts" USING btree ("due_date");--> statement-breakpoint
CREATE INDEX "debts_created_at_idx" ON "debts" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "history_events_user_id_idx" ON "history_events" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "history_events_debt_id_idx" ON "history_events" USING btree ("debt_id");--> statement-breakpoint
CREATE INDEX "history_events_payment_id_idx" ON "history_events" USING btree ("payment_id");--> statement-breakpoint
CREATE INDEX "history_events_user_created_at_idx" ON "history_events" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE INDEX "history_events_event_type_idx" ON "history_events" USING btree ("event_type");--> statement-breakpoint
CREATE UNIQUE INDEX "payment_schedules_debt_id_unique_idx" ON "payment_schedules" USING btree ("debt_id");--> statement-breakpoint
CREATE INDEX "payment_schedules_frequency_idx" ON "payment_schedules" USING btree ("frequency");--> statement-breakpoint
CREATE INDEX "payments_debt_id_idx" ON "payments" USING btree ("debt_id");--> statement-breakpoint
CREATE INDEX "payments_paid_at_idx" ON "payments" USING btree ("paid_at");--> statement-breakpoint
CREATE INDEX "payments_debt_paid_at_idx" ON "payments" USING btree ("debt_id","paid_at");--> statement-breakpoint
CREATE INDEX "reminders_log_debt_id_idx" ON "reminders_log" USING btree ("debt_id");--> statement-breakpoint
CREATE INDEX "reminders_log_sent_at_idx" ON "reminders_log" USING btree ("sent_at");--> statement-breakpoint
CREATE INDEX "reminders_log_debt_sent_at_idx" ON "reminders_log" USING btree ("debt_id","sent_at");