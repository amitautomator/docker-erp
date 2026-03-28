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

// ─── Types ────────────────────────────────────────────────────────────────────

export type GSTConfig = {
  cgst: number; // Central GST        e.g. 9  (half of 18% slab, intra-state)
  sgst: number; // State GST          e.g. 9  (half of 18% slab, intra-state)
  igst: number; // Integrated GST     e.g. 18 (full slab, inter-state)
  cess?: number; // Additional cess    e.g. 5  (tobacco, luxury cars, etc.)
};

// ─── Enums ────────────────────────────────────────────────────────────────────

export const roleEnum = pgEnum("role", ["member", "admin", "owner", "manager"]);

export const userStatusEnum = pgEnum("user_status", [
  "active",
  "inactive",
  "suspended",
  "pending",
]);

// ─── Users ────────────────────────────────────────────────────────────────────

export const users = pgTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  image: text("image"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
  banned: boolean("banned").default(false),
  banReason: text("ban_reason"),
  banExpires: timestamp("ban_expires", { withTimezone: true }),
  phone: text("phone"),
  dob: date("dob"),
  doj: date("doj"),
  isActive: boolean("is_active").default(true),
  status: userStatusEnum("status"),
  transferDate: timestamp("transfer_date", { withTimezone: true }),
  transferReason: text("transfer_reason"),
  subscriptionType: text("subscription_type"),
  subscriptionStartedAt: timestamp("subscription_started_at", {
    withTimezone: true,
  }),
  subscriptionExpiresAt: timestamp("subscription_expires_at", {
    withTimezone: true,
  }),
  subscriptionStatus: text("subscription_status"),
  lastLoginMethod: text("last_login_method"),
});

// ─── Session ──────────────────────────────────────────────────────────────────

export const session = pgTable(
  "session",
  {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    token: text("token").notNull().unique(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    impersonatedBy: text("impersonated_by"),
  },
  (table) => ({
    tokenIdx: index("session_token_idx").on(table.token),
  }),
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
      withTimezone: true,
    }),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at", {
      withTimezone: true,
    }),
    scope: text("scope"),
    password: text("password"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => ({
    userIdIdx: index("account_userId_idx").on(table.userId),
    uniqueProviderAccount: unique().on(table.providerId, table.accountId),
  }),
);

// ─── Verification ─────────────────────────────────────────────────────────────

export const verification = pgTable(
  "verification",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => ({
    identifierIdx: index("verification_identifier_idx").on(table.identifier),
  }),
);

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
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  metadata: jsonb("metadata"),
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
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    organizationIdIdx: index("member_organizationId_idx").on(
      table.organizationId,
    ),
    userIdIdx: index("member_userId_idx").on(table.userId),
    uniqueOrgUser: unique().on(table.organizationId, table.userId),
  }),
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
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    inviterId: text("inviter_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
  },
  (table) => ({
    organizationIdIdx: index("invitation_organizationId_idx").on(
      table.organizationId,
    ),
    emailIdx: index("invitation_email_idx").on(table.email),
    statusIdx: index("invitation_status_idx").on(table.status),
  }),
);

// ─── Products ─────────────────────────────────────────────────────────────────

export const products = pgTable(
  "products",
  {
    id: text("id").primaryKey(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    sku: text("sku"),
    price: integer("price").notNull(), // stored in paise/cents
    stock: integer("stock").default(0),
    category: text("category"),
    isActive: boolean("is_active").default(true).notNull(),
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => ({
    organizationIdIdx: index("products_organization_id_idx").on(
      table.organizationId,
    ),
    skuIdx: index("products_sku_idx").on(table.sku),
    categoryIdx: index("products_category_idx").on(table.category),
    orgActiveIdx: index("products_org_active_idx").on(
      table.organizationId,
      table.isActive,
    ),
  }),
);

//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//

export const invoiceSetting = pgTable("invoice_setting", {
  id: text("id").primaryKey(),
  organizationId: text("organization_id")
    .notNull()
    .unique()
    .references(() => organization.id, { onDelete: "cascade" }),

  // ── Document Type Registry ────────────────────────────────────────────────
  // DB default kept — structural, needed immediately on org creation.
  // When user adds a custom type, also insert a row in document_counters.
  invoice_types: jsonb("invoice_types")
    .$type<string[]>()
    .default(["invoice", "proforma", "credit_note", "debit_note", "quote"])
    .notNull(),

  // ── Per-Type Config ───────────────────────────────────────────────────────
  // All nullable — null means "use UI default from lib/invoice-defaults.ts"

  // e.g. { invoice: "INV", proforma: "PRF", credit_note: "CN" }
  prefix: jsonb("prefix").$type<Record<string, string>>(),

  // e.g. { invoice: 4, proforma: 3 }  →  formats as INV-0042, PRF-007
  number_padding: jsonb("number_padding").$type<Record<string, number>>(),

  // e.g. { invoice: 30, proforma: 15, quote: 7 }
  default_due_days: jsonb("default_due_days").$type<Record<string, number>>(),

  // e.g. { invoice: ["draft","sent","paid","overdue","cancelled","partially_paid"] }
  status_options: jsonb("status_options").$type<Record<string, string[]>>(),

  // e.g. { invoice: ["cash","bank_transfer","upi","cheque","card","other"] }
  payment_method_options: jsonb("payment_method_options").$type<
    Record<string, string[]>
  >(),

  // e.g. { invoice: ["unpaid","partially_paid","paid","refunded","written_off"] }
  payment_status_options: jsonb("payment_status_options").$type<
    Record<string, string[]>
  >(),

  show_logo: jsonb("show_logo").$type<Record<string, boolean>>(),

  show_tax_breakdown:
    jsonb("show_tax_breakdown").$type<Record<string, boolean>>(),

  show_terms_and_conditions: jsonb("show_terms_and_conditions").$type<
    Record<string, boolean>
  >(),

  // e.g. { invoice: "All sales are final...", proforma: "Subject to change..." }
  terms_condition: jsonb("terms_condition").$type<Record<string, string>>(),

  general_tax: jsonb("general_tax").$type<Record<string, GSTConfig>>(),

  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// ════════════════════════════════════════════════════════════════════════════
// SECTION 2b — DOCUMENT COUNTERS
// One row per org × document type.
// Kept separate from invoiceSetting so counters increment atomically.
//
// ⚠️  ALWAYS increment with sql, never read-modify-write:
//   db.update(documentCounters)
//     .set({ current_number: sql`${documentCounters.current_number} + 1` })
//     .where(and(
//       eq(documentCounters.organizationId, orgId),
//       eq(documentCounters.type, "invoice")
//     ))
//     .returning({ current_number: documentCounters.current_number })
//
// ⚠️  Wrap counter increment + document insert in ONE transaction.
// ════════════════════════════════════════════════════════════════════════════

export const documentCounters = pgTable(
  "document_counters",
  {
    id: text("id").primaryKey(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),

    // Matches a key in invoiceSetting.invoice_types
    // e.g. "invoice" | "proforma" | "credit_note" | any custom type
    type: varchar("type", { length: 50 }).notNull(),

    // DB default kept — counter must always start at 1, never null
    current_number: integer("current_number").default(1).notNull(),
  },
  (table) => ({
    uniqueOrgType: unique().on(table.organizationId, table.type),
    orgIdx: index("document_counters_org_idx").on(table.organizationId),
  }),
);

// ─── Relations ────────────────────────────────────────────────────────────────

export const usersRelations = relations(users, ({ many }) => ({
  sessions: many(session),
  accounts: many(account),
  members: many(member),
  invitations: many(invitation),
}));

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(users, { fields: [session.userId], references: [users.id] }),
  member: one(member, {
    fields: [session.userId],
    references: [member.userId],
  }),
}));

export const accountRelations = relations(account, ({ one }) => ({
  user: one(users, { fields: [account.userId], references: [users.id] }),
}));

export const organizationRelations = relations(
  organization,
  ({ many, one }) => ({
    members: many(member),
    invitations: many(invitation),
    products: many(products),
    documentCounters: many(documentCounters),
    invoiceSetting: one(invoiceSetting, {
      fields: [organization.id],
      references: [invoiceSetting.organizationId],
    }),
  }),
);

export const memberRelations = relations(member, ({ one }) => ({
  organization: one(organization, {
    fields: [member.organizationId],
    references: [organization.id],
  }),
  user: one(users, { fields: [member.userId], references: [users.id] }),
}));

export const invitationRelations = relations(invitation, ({ one }) => ({
  organization: one(organization, {
    fields: [invitation.organizationId],
    references: [organization.id],
  }),
  inviter: one(users, {
    fields: [invitation.inviterId],
    references: [users.id],
  }),
}));

export const invoiceSettingRelations = relations(invoiceSetting, ({ one }) => ({
  organization: one(organization, {
    fields: [invoiceSetting.organizationId],
    references: [organization.id],
  }),
}));

export const documentCountersRelations = relations(
  documentCounters,
  ({ one }) => ({
    organization: one(organization, {
      fields: [documentCounters.organizationId],
      references: [organization.id],
    }),
  }),
);

export const productsRelations = relations(products, ({ one }) => ({
  organization: one(organization, {
    fields: [products.organizationId],
    references: [organization.id],
  }),
}));
