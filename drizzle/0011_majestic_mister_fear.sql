CREATE TYPE "public"."role" AS ENUM('member', 'admin', 'owner');--> statement-breakpoint
DROP INDEX "session_userId_idx";--> statement-breakpoint
ALTER TABLE "invitation" ALTER COLUMN "role" SET DEFAULT 'member'::"public"."role";--> statement-breakpoint
ALTER TABLE "invitation" ALTER COLUMN "role" SET DATA TYPE "public"."role" USING "role"::"public"."role";--> statement-breakpoint
ALTER TABLE "invitation" ALTER COLUMN "role" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "member" ALTER COLUMN "role" SET DEFAULT 'member'::"public"."role";--> statement-breakpoint
ALTER TABLE "member" ALTER COLUMN "role" SET DATA TYPE "public"."role" USING "role"::"public"."role";--> statement-breakpoint
ALTER TABLE "organization" ALTER COLUMN "team_size" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "organization" ALTER COLUMN "metadata" SET DATA TYPE jsonb;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "dob" SET DATA TYPE date;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "doj" SET DATA TYPE date;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "transfer_date" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "subscription_started_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "subscription_expires_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
CREATE INDEX "invitation_status_idx" ON "invitation" USING btree ("status");--> statement-breakpoint
CREATE INDEX "session_token_idx" ON "session" USING btree ("token");--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_provider_id_account_id_unique" UNIQUE("provider_id","account_id");--> statement-breakpoint
ALTER TABLE "member" ADD CONSTRAINT "member_organization_id_user_id_unique" UNIQUE("organization_id","user_id");