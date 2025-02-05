CREATE TABLE IF NOT EXISTS "project_spreadsheets" (
	"id" text PRIMARY KEY NOT NULL,
	"project_id" text NOT NULL,
	"spreadsheet_id" text NOT NULL,
	"spreadsheet_name" text NOT NULL,
	"access_token" text NOT NULL,
	"refresh_token" text,
	"token_expiry_date" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "project" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"user_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "project_spreadsheets" ADD CONSTRAINT "project_spreadsheets_project_id_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."project"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
