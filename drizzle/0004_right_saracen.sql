DROP INDEX IF EXISTS "google_tokens_user_id_idx";--> statement-breakpoint
ALTER TABLE "google_token" ALTER COLUMN "created_at" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "google_token" ALTER COLUMN "updated_at" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "google_token" ADD CONSTRAINT "google_token_user_id_unique" UNIQUE("user_id");