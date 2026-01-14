ALTER TABLE "organization" ADD COLUMN "business_type" varchar(255);--> statement-breakpoint
ALTER TABLE "organization" ADD COLUMN "city" varchar(255);--> statement-breakpoint
ALTER TABLE "organization" ADD COLUMN "is_active" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "organization" ADD COLUMN "description" varchar(1024);--> statement-breakpoint
ALTER TABLE "organization" ADD COLUMN "team_size" integer;--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "role";