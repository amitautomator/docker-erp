ALTER TABLE "organization" ADD COLUMN "team_size" text;--> statement-breakpoint
ALTER TABLE "organization" ADD COLUMN "business_phone" text;--> statement-breakpoint
ALTER TABLE "organization" ADD COLUMN "business_email" text;--> statement-breakpoint
ALTER TABLE "organization" ADD COLUMN "business_type" text;--> statement-breakpoint
ALTER TABLE "organization" ADD COLUMN "business_address" text;--> statement-breakpoint
ALTER TABLE "organization" ADD COLUMN "business_website" text;--> statement-breakpoint
ALTER TABLE "organization" ADD COLUMN "gst" text;--> statement-breakpoint
ALTER TABLE "organization" ADD COLUMN "is_active" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "organization" ADD COLUMN "updated_at" timestamp DEFAULT now() NOT NULL;