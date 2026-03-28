import { relations } from "drizzle-orm";
import {
  unique,
  pgTable,
  text,
  timestamp,
  boolean,
  index,
  date,
  pgEnum,
  integer,
  jsonb,
  varchar,
} from "drizzle-orm/pg-core";

export const timestamps = {
  createdAt: timestamp("created_at", { mode: "date", withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { mode: "date", withTimezone: true })
    .defaultNow()
    .notNull()
    .$onUpdateFn(() => new Date()),
};

export type GSTConfig = {
  cgst: number; // Central GST        e.g. 9  (half of 18% slab, intra-state)
  sgst: number; // State GST          e.g. 9  (half of 18% slab, intra-state)
  igst: number; // Integrated GST     e.g. 18 (full slab, inter-state)
  cess?: number; // Additional cess    e.g. 5  (tobacco, luxury cars, etc.)
};

export const roleEnum = pgEnum("role", ["member", "admin", "owner", "manager"]);

export const userStatusEnum = pgEnum("user_status", [
  "active",
  "inactive",
  "suspended",
  "pending",
]);

export const fieldTypeEnum = pgEnum("field_type", [
  "text",
  "number",
  "email",
  "phone",
  "date",
  "textarea",
  "dropdown",
  "checkbox",
  "file",
]);

// ════════════════════════════════════════════════════════════════════════════
// SECTION 1 — AUTH & IDENTITY
// ════════════════════════════════════════════════════════════════════════════

// ─── Users ────────────────────────────────────────────────────────────────────

export const users = pgTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  image: text("image"),
  banned: boolean("banned").default(false),
  banReason: text("ban_reason"),
  banExpires: timestamp("ban_expires", { mode: "date", withTimezone: true }),
  phone: text("phone"),
  dob: date("dob"),
  doj: date("doj"),
  isActive: boolean("is_active").default(true),
  status: userStatusEnum("status"),
  transferDate: timestamp("transfer_date", {
    mode: "date",
    withTimezone: true,
  }),
  transferReason: text("transfer_reason"),
  subscriptionType: text("subscription_type"),
  subscriptionStartedAt: timestamp("subscription_started_at", {
    mode: "date",
    withTimezone: true,
  }),
  subscriptionExpiresAt: timestamp("subscription_expires_at", {
    mode: "date",
    withTimezone: true,
  }),
  subscriptionStatus: text("subscription_status"),
  lastLoginMethod: text("last_login_method"),
  ...timestamps,
});

// ─── Session ──────────────────────────────────────────────────────────────────

export const session = pgTable(
  "session",
  {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expires_at", {
      mode: "date",
      withTimezone: true,
    }).notNull(),
    token: text("token").notNull().unique(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    impersonatedBy: text("impersonated_by"),
    ...timestamps,
  },
  (table) => [index("session_token_idx").on(table.token)],
);

// ─── Account ──────────────────────────────────────────────────────────────────

export const account = pgTable(
  "account",
  {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at", {
      mode: "date",
      withTimezone: true,
    }),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at", {
      mode: "date",
      withTimezone: true,
    }),
    scope: text("scope"),
    password: text("password"),
    ...timestamps,
  },
  (table) => [
    index("account_userId_idx").on(table.userId),
    unique("account_provider_unique").on(table.providerId, table.accountId),
  ],
);

// ─── Verification ─────────────────────────────────────────────────────────────

export const verification = pgTable(
  "verification",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at", {
      mode: "date",
      withTimezone: true,
    }).notNull(),
    ...timestamps,
  },
  (table) => [index("verification_identifier_idx").on(table.identifier)],
);

// ════════════════════════════════════════════════════════════════════════════
// SECTION 2 — ORGANIZATION & MEMBERSHIP
// ════════════════════════════════════════════════════════════════════════════

// ─── Organization ─────────────────────────────────────────────────────────────

export const organization = pgTable("organization", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  logo: text("logo"),
  team_size: integer("team_size"),
  business_phone: text("business_phone"),
  business_email: text("business_email"),
  business_type: text("business_type"),
  business_address: text("business_address"),
  business_city: text("business_city"),
  business_state: text("business_state"),
  business_country: text("business_country"),
  business_pincode: text("business_pincode"),
  business_website: text("business_website"),
  gst: text("gst"),
  isActive: boolean("is_active").default(true).notNull(),
  metadata: jsonb("metadata"),
  ...timestamps,
});

// ─── Member ───────────────────────────────────────────────────────────────────

export const member = pgTable(
  "member",
  {
    id: text("id").primaryKey(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    role: roleEnum("role").default("member").notNull(),
    createdAt: timestamp("created_at", { mode: "date", withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("member_organizationId_idx").on(table.organizationId),
    index("member_userId_idx").on(table.userId),
    unique("member_org_user_unique").on(table.organizationId, table.userId),
  ],
);

// ─── Invitation ───────────────────────────────────────────────────────────────

export const invitation = pgTable(
  "invitation",
  {
    id: text("id").primaryKey(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    email: text("email").notNull(),
    role: roleEnum("role").default("member").notNull(),
    status: text("status").default("pending").notNull(),
    expiresAt: timestamp("expires_at", {
      mode: "date",
      withTimezone: true,
    }).notNull(),
    inviterId: text("inviter_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { mode: "date", withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("invitation_organizationId_idx").on(table.organizationId),
    index("invitation_email_idx").on(table.email),
    index("invitation_status_idx").on(table.status),
  ],
);

// ════════════════════════════════════════════════════════════════════════════
// SECTION 3 — PRODUCTS
// ════════════════════════════════════════════════════════════════════════════

export const products = pgTable(
  "products",
  {
    id: text("id").primaryKey(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    sku: text("sku"),
    price: integer("price").notNull(), // stored in paise
    stock: integer("stock").default(0),
    category: text("category"),
    isActive: boolean("is_active").default(true).notNull(),
    metadata: jsonb("metadata"),
    ...timestamps,
  },
  (table) => [
    index("products_organization_id_idx").on(table.organizationId),
    index("products_sku_idx").on(table.sku),
    index("products_category_idx").on(table.category),
    index("products_org_active_idx").on(table.organizationId, table.isActive),
  ],
);

// ════════════════════════════════════════════════════════════════════════════
// SECTION 4 — INVOICE SETTINGS
//
// Per-document-type config stored as JSONB objects keyed by type name.
// One row per org. All JSONB columns are nullable — defaults live in
// lib/invoice-defaults.ts, not the DB.
//
// App usage pattern:
//   const prefix = settings?.prefix ?? DEFAULT_PREFIX
// ════════════════════════════════════════════════════════════════════════════

export const invoiceSetting = pgTable("invoice_setting", {
  id: text("id").primaryKey(),
  organizationId: text("organization_id")
    .notNull()
    .unique()
    .references(() => organization.id, { onDelete: "cascade" }),

  // Structural — DB default kept, needed immediately on org creation.
  // When user adds a custom type, also insert a row in document_counters.
  invoice_types: jsonb("invoice_types")
    .$type<string[]>()
    .default(["invoice", "proforma", "credit_note", "debit_note", "quote"])
    .notNull(),

  // All nullable — null means "use UI default from lib/invoice-defaults.ts"
  prefix: jsonb("prefix").$type<Record<string, string>>(),
  number_padding: jsonb("number_padding").$type<Record<string, number>>(),
  default_due_days: jsonb("default_due_days").$type<Record<string, number>>(),
  status_options: jsonb("status_options").$type<Record<string, string[]>>(),
  payment_method_options: jsonb("payment_method_options").$type<
    Record<string, string[]>
  >(),
  payment_status_options: jsonb("payment_status_options").$type<
    Record<string, string[]>
  >(),
  show_logo: jsonb("show_logo").$type<Record<string, boolean>>(),
  show_tax_breakdown:
    jsonb("show_tax_breakdown").$type<Record<string, boolean>>(),
  show_terms_and_conditions: jsonb("show_terms_and_conditions").$type<
    Record<string, boolean>
  >(),
  terms_condition: jsonb("terms_condition").$type<Record<string, string>>(),
  general_tax: jsonb("general_tax").$type<Record<string, GSTConfig>>(),
  ...timestamps,
});

// ════════════════════════════════════════════════════════════════════════════
// SECTION 4b — DOCUMENT COUNTERS
//
// One row per org x document type. Kept separate so counters increment
// atomically without locking the invoiceSetting row.
//
// ALWAYS increment with sql`... + 1`, never read-modify-write:
//   db.update(documentCounters)
//     .set({ current_number: sql`${documentCounters.current_number} + 1` })
//     .where(and(
//       eq(documentCounters.organizationId, orgId),
//       eq(documentCounters.type, "invoice"),
//     ))
//     .returning({ current_number: documentCounters.current_number })
//
// Wrap counter increment + document insert in ONE transaction.
// ════════════════════════════════════════════════════════════════════════════

export const documentCounters = pgTable(
  "document_counters",
  {
    id: text("id").primaryKey(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    // Matches a key in invoiceSetting.invoice_types
    type: varchar("type", { length: 50 }).notNull(),
    // DB default kept — counter must always start at 1, never null
    current_number: integer("current_number").default(1).notNull(),
  },
  (table) => [
    unique("document_counters_org_type_unique").on(
      table.organizationId,
      table.type,
    ),
    index("document_counters_org_idx").on(table.organizationId),
  ],
);

// ════════════════════════════════════════════════════════════════════════════
// SECTION 5 — CLIENT MANAGEMENT
//
// Multi-tenant client CRM with org-scoped custom fields.
//
// Design decisions:
//   • organizationId is mandatory on every table — full tenant isolation.
//   • customFieldDefinitions are per-org; each org defines its own schema.
//   • text PKs (nanoid/cuid) match the rest of the codebase.
//   • timestamps spread keeps all audit columns consistent.
//   • File fields produce clientAttachments rows, not clientFieldValues rows.
//     storageKey -> S3/R2/local path. Never store base64 in Postgres.
//   • valueBool covers checkbox. valueText covers everything else except file.
//   • unique(clientId, fieldDefId) prevents duplicate value rows per field.
// ════════════════════════════════════════════════════════════════════════════

// ─── Custom Field Definitions ─────────────────────────────────────────────────
// One row per field the org defines for its client intake form.

export const customFieldDefinitions = pgTable(
  "custom_field_definitions",
  {
    id: text("id").primaryKey(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    label: text("label").notNull(),
    fieldType: fieldTypeEnum("field_type").notNull().default("text"),
    required: boolean("required").notNull().default(false),
    placeholder: text("placeholder"),
    accept: text("accept"), // e.g. ".pdf,.jpg"
    multiple: boolean("multiple").default(false),
    sortOrder: integer("sort_order").notNull().default(0),
    isActive: boolean("is_active").default(true).notNull(),
    ...timestamps,
  },
  (table) => [
    index("custom_field_def_org_idx").on(table.organizationId),
    index("custom_field_def_org_active_idx").on(
      table.organizationId,
      table.isActive,
    ),
  ],
);

// ─── Dropdown Options ─────────────────────────────────────────────────────────
// Only populated for fields where fieldType = 'dropdown'.

export const dropdownOptions = pgTable(
  "dropdown_options",
  {
    id: text("id").primaryKey(),
    fieldDefId: text("field_def_id")
      .notNull()
      .references(() => customFieldDefinitions.id, { onDelete: "cascade" }),
    label: text("label").notNull(),
    value: text("value").notNull(),
    sortOrder: integer("sort_order").notNull().default(0),
  },
  (table) => [index("dropdown_options_field_def_idx").on(table.fieldDefId)],
);

// ─── Clients ──────────────────────────────────────────────────────────────────
// Core identity columns live here as typed columns.
// All org-specific extra fields go into clientFieldValues below.

export const clients = pgTable(
  "clients",
  {
    id: text("id").primaryKey(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    name: text("name").notNull(),

    email: text("email"),
    phone: text("phone"),
    isActive: boolean("is_active").default(true).notNull(),
    ...timestamps,
  },
  (table) => [
    index("clients_org_idx").on(table.organizationId),
    index("clients_org_active_idx").on(table.organizationId, table.isActive),
    // Useful for search / dedupe within an org
    index("clients_org_email_idx").on(table.organizationId, table.email),
  ],
);

// ─── Client Field Values ──────────────────────────────────────────────────────
// One row per (client x field definition) pair.
//
//   fieldType              column used
//   ─────────────────────────────────
//   text / number / email
//   phone / date / textarea
//   dropdown            -> valueText
//   checkbox            -> valueBool
//   file                -> clientAttachments (separate table)

export const clientFieldValues = pgTable(
  "client_field_values",
  {
    id: text("id").primaryKey(),
    clientId: text("client_id")
      .notNull()
      .references(() => clients.id, { onDelete: "cascade" }),
    fieldDefId: text("field_def_id")
      .notNull()
      .references(() => customFieldDefinitions.id, { onDelete: "cascade" }),
    valueText: text("value_text"),
    valueBool: boolean("value_bool"),
    ...timestamps,
  },
  (table) => [
    index("client_field_values_client_idx").on(table.clientId),
    // One value row per client+field — enforced at DB level
    unique("client_field_values_unique").on(table.clientId, table.fieldDefId),
  ],
);

// ─── Client Attachments ───────────────────────────────────────────────────────
// File-type custom fields produce rows here, not in clientFieldValues.
// fieldDefId is nullable — allows general attachments not tied to a field.
// storageKey -> S3 / R2 / local path; never store base64 in Postgres.

export const clientAttachments = pgTable(
  "client_attachments",
  {
    id: text("id").primaryKey(),
    clientId: text("client_id")
      .notNull()
      .references(() => clients.id, { onDelete: "cascade" }),
    fieldDefId: text("field_def_id").references(
      () => customFieldDefinitions.id,
      { onDelete: "set null" },
    ),
    fileName: text("file_name").notNull(),
    fileSize: integer("file_size").notNull(), // bytes
    mimeType: text("mime_type").notNull(),
    storageKey: text("storage_key").notNull(), // e.g. "uploads/clients/c1/contract.pdf"
    uploadedAt: timestamp("uploaded_at", { mode: "date", withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("client_attachments_client_idx").on(table.clientId),
    index("client_attachments_field_def_idx").on(table.fieldDefId),
  ],
);

// ════════════════════════════════════════════════════════════════════════════
// RELATIONS — defineRelations() (Drizzle v2 relational API)
//
// defineRelations() replaces the old per-table relations() calls.
// Both the foreign-key declarations on the table AND these relation
// definitions are required for db.query.*.findMany({ with: {...} }) to work.
//
// Usage example:
//   const client = await db.query.clients.findFirst({
//     where: { id: clientId },
//     with: {
//       fieldValues: { with: { fieldDef: true } },
//       attachments: true,
//     },
//   });
// ════════════════════════════════════════════════════════════════════════════

export const usersRelations = relations(users, (r) => ({
  sessions: r.many(session),
  accounts: r.many(account),
  members: r.many(member),
  invitations: r.many(invitation),
}));

export const sessionRelations = relations(session, (r) => ({
  user: r.one(users, {
    fields: [session.userId],
    references: [users.id],
  }),
}));

export const accountRelations = relations(account, (r) => ({
  user: r.one(users, {
    fields: [account.userId],
    references: [users.id],
  }),
}));

export const organizationRelations = relations(organization, (r) => ({
  members: r.many(member),
  invitations: r.many(invitation),
  products: r.many(products),
  documentCounters: r.many(documentCounters),
  invoiceSetting: r.one(invoiceSetting),
  clients: r.many(clients),
  customFieldDefinitions: r.many(customFieldDefinitions),
}));

export const memberRelations = relations(member, (r) => ({
  organization: r.one(organization, {
    fields: [member.organizationId],
    references: [organization.id],
  }),
  user: r.one(users, {
    fields: [member.userId],
    references: [users.id],
  }),
}));

export const invitationRelations = relations(invitation, (r) => ({
  organization: r.one(organization, {
    fields: [invitation.organizationId],
    references: [organization.id],
  }),
  inviter: r.one(users, {
    fields: [invitation.inviterId],
    references: [users.id],
  }),
}));

export const productsRelations = relations(products, (r) => ({
  organization: r.one(organization, {
    fields: [products.organizationId],
    references: [organization.id],
  }),
}));

export const invoiceSettingRelations = relations(invoiceSetting, (r) => ({
  organization: r.one(organization, {
    fields: [invoiceSetting.organizationId],
    references: [organization.id],
  }),
}));

export const documentCountersRelations = relations(documentCounters, (r) => ({
  organization: r.one(organization, {
    fields: [documentCounters.organizationId],
    references: [organization.id],
  }),
}));

export const customFieldDefinitionsRelations = relations(
  customFieldDefinitions,
  (r) => ({
    organization: r.one(organization, {
      fields: [customFieldDefinitions.organizationId],
      references: [organization.id],
    }),
    options: r.many(dropdownOptions),
    fieldValues: r.many(clientFieldValues),
    attachments: r.many(clientAttachments),
  }),
);

export const dropdownOptionsRelations = relations(dropdownOptions, (r) => ({
  fieldDef: r.one(customFieldDefinitions, {
    fields: [dropdownOptions.fieldDefId],
    references: [customFieldDefinitions.id],
  }),
}));

export const clientsRelations = relations(clients, (r) => ({
  organization: r.one(organization, {
    fields: [clients.organizationId],
    references: [organization.id],
  }),
  fieldValues: r.many(clientFieldValues),
  attachments: r.many(clientAttachments),
}));

export const clientFieldValuesRelations = relations(clientFieldValues, (r) => ({
  client: r.one(clients, {
    fields: [clientFieldValues.clientId],
    references: [clients.id],
  }),
  fieldDef: r.one(customFieldDefinitions, {
    fields: [clientFieldValues.fieldDefId],
    references: [customFieldDefinitions.id],
  }),
}));

export const clientAttachmentsRelations = relations(clientAttachments, (r) => ({
  client: r.one(clients, {
    fields: [clientAttachments.clientId],
    references: [clients.id],
  }),
  fieldDef: r.one(customFieldDefinitions, {
    fields: [clientAttachments.fieldDefId],
    references: [customFieldDefinitions.id],
  }),
}));

// ════════════════════════════════════════════════════════════════════════════
// INFERRED TYPES
// Use these throughout your app — never write manual type definitions.
// $inferSelect = what you get back from a query
// $inferInsert = what you pass into an insert
// ════════════════════════════════════════════════════════════════════════════

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Organization = typeof organization.$inferSelect;
export type NewOrganization = typeof organization.$inferInsert;

export type Member = typeof member.$inferSelect;
export type NewMember = typeof member.$inferInsert;

export type Invitation = typeof invitation.$inferSelect;
export type NewInvitation = typeof invitation.$inferInsert;

export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;

export type InvoiceSetting = typeof invoiceSetting.$inferSelect;
export type NewInvoiceSetting = typeof invoiceSetting.$inferInsert;

export type DocumentCounter = typeof documentCounters.$inferSelect;
export type NewDocumentCounter = typeof documentCounters.$inferInsert;

export type CustomFieldDefinition = typeof customFieldDefinitions.$inferSelect;
export type NewCustomFieldDefinition =
  typeof customFieldDefinitions.$inferInsert;

export type DropdownOption = typeof dropdownOptions.$inferSelect;
export type NewDropdownOption = typeof dropdownOptions.$inferInsert;

export type Client = typeof clients.$inferSelect;
export type NewClient = typeof clients.$inferInsert;

export type ClientFieldValue = typeof clientFieldValues.$inferSelect;
export type NewClientFieldValue = typeof clientFieldValues.$inferInsert;

export type ClientAttachment = typeof clientAttachments.$inferSelect;
export type NewClientAttachment = typeof clientAttachments.$inferInsert;
