CREATE TYPE "public"."user_status" AS ENUM('active', 'inactive', 'suspended', 'pending');--> statement-breakpoint
ALTER TABLE "products" ALTER COLUMN "price" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "status" SET DATA TYPE "public"."user_status" USING "status"::"public"."user_status";