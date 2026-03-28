CREATE TYPE "public"."field_type" AS ENUM('text', 'number', 'email', 'phone', 'date', 'textarea', 'dropdown', 'checkbox', 'file');--> statement-breakpoint
CREATE TABLE "client_attachments" (
	"id" text PRIMARY KEY NOT NULL,
	"client_id" text NOT NULL,
	"field_def_id" text,
	"file_name" text NOT NULL,
	"file_size" integer NOT NULL,
	"mime_type" text NOT NULL,
	"storage_key" text NOT NULL,
	"uploaded_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "client_field_values" (
	"id" text PRIMARY KEY NOT NULL,
	"client_id" text NOT NULL,
	"field_def_id" text NOT NULL,
	"value_text" text,
	"value_bool" boolean,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "client_field_values_unique" UNIQUE("client_id","field_def_id")
);
--> statement-breakpoint
CREATE TABLE "clients" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"name" text NOT NULL,
	"email" text,
	"phone" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "custom_field_definitions" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"label" text NOT NULL,
	"field_type" "field_type" DEFAULT 'text' NOT NULL,
	"required" boolean DEFAULT false NOT NULL,
	"placeholder" text,
	"accept" text,
	"multiple" boolean DEFAULT false,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "dropdown_options" (
	"id" text PRIMARY KEY NOT NULL,
	"field_def_id" text NOT NULL,
	"label" text NOT NULL,
	"value" text NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
ALTER TABLE "account" DROP CONSTRAINT "account_provider_id_account_id_unique";--> statement-breakpoint
ALTER TABLE "document_counters" DROP CONSTRAINT "document_counters_organization_id_type_unique";--> statement-breakpoint
ALTER TABLE "member" DROP CONSTRAINT "member_organization_id_user_id_unique";--> statement-breakpoint
ALTER TABLE "client_attachments" ADD CONSTRAINT "client_attachments_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "client_attachments" ADD CONSTRAINT "client_attachments_field_def_id_custom_field_definitions_id_fk" FOREIGN KEY ("field_def_id") REFERENCES "public"."custom_field_definitions"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "client_field_values" ADD CONSTRAINT "client_field_values_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "client_field_values" ADD CONSTRAINT "client_field_values_field_def_id_custom_field_definitions_id_fk" FOREIGN KEY ("field_def_id") REFERENCES "public"."custom_field_definitions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clients" ADD CONSTRAINT "clients_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "custom_field_definitions" ADD CONSTRAINT "custom_field_definitions_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dropdown_options" ADD CONSTRAINT "dropdown_options_field_def_id_custom_field_definitions_id_fk" FOREIGN KEY ("field_def_id") REFERENCES "public"."custom_field_definitions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "client_attachments_client_idx" ON "client_attachments" USING btree ("client_id");--> statement-breakpoint
CREATE INDEX "client_attachments_field_def_idx" ON "client_attachments" USING btree ("field_def_id");--> statement-breakpoint
CREATE INDEX "client_field_values_client_idx" ON "client_field_values" USING btree ("client_id");--> statement-breakpoint
CREATE INDEX "clients_org_idx" ON "clients" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "clients_org_active_idx" ON "clients" USING btree ("organization_id","is_active");--> statement-breakpoint
CREATE INDEX "clients_org_email_idx" ON "clients" USING btree ("organization_id","email");--> statement-breakpoint
CREATE INDEX "custom_field_def_org_idx" ON "custom_field_definitions" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "custom_field_def_org_active_idx" ON "custom_field_definitions" USING btree ("organization_id","is_active");--> statement-breakpoint
CREATE INDEX "dropdown_options_field_def_idx" ON "dropdown_options" USING btree ("field_def_id");--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_provider_unique" UNIQUE("provider_id","account_id");--> statement-breakpoint
ALTER TABLE "document_counters" ADD CONSTRAINT "document_counters_org_type_unique" UNIQUE("organization_id","type");--> statement-breakpoint
ALTER TABLE "member" ADD CONSTRAINT "member_org_user_unique" UNIQUE("organization_id","user_id");