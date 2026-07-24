CREATE TABLE "user_settings" (
	"user_id" uuid PRIMARY KEY NOT NULL,
	"whatsapp_number" varchar(20),
	"full_name" varchar(150),
	"reminder_template" text,
	"agreement_template" text,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
