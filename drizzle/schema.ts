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
  serial,
} from "drizzle-orm/pg-core";

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
  status: userStatusEnum("status"), // was untyped text — now enum-validated
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

// ─── General Setting ──────────────────────────────────────────────────────────

export const generalSetting = pgTable("general_setting", {
  id: text("id").primaryKey(),
  organizationId: text("organization_id")
    .notNull()
    .unique()
    .references(() => organization.id, { onDelete: "cascade" }),
  billing_name: varchar("billing_name", { length: 255 }).notNull(),
  billing_email: varchar("billing_email", { length: 255 }).notNull(),
  billing_address: text("billing_address").notNull(),
  billing_phone: varchar("billing_phone", { length: 20 }),
  billing_gst: varchar("billing_gst", { length: 50 }),
  billing_logo: text("billing_logo"),
  billing_city: varchar("billing_city", { length: 100 }),
  billing_state: varchar("billing_state", { length: 100 }),
  billing_country: varchar("billing_country", { length: 100 }),
  billing_pincode: varchar("billing_pincode", { length: 20 }),
  billing_currency: varchar("billing_currency", { length: 10 }),
  invoice_prefix: varchar("invoice_prefix", { length: 20 }),
  // IMPORTANT: Always increment invoice_number transactionally to avoid race conditions:
  //   db.update(generalSetting)
  //     .set({ invoice_number: sql`${generalSetting.invoice_number} + 1` })
  //     .where(eq(generalSetting.organizationId, orgId))
  //     .returning({ invoice_number: generalSetting.invoice_number })
  invoice_number: integer("invoice_number").default(1).notNull(),
  default_dueDays: integer("default_due_days").default(30).notNull(),
  invoice_terms: text("invoice_terms"),
  invoice_type: varchar("invoice_type", { length: 50 }),
  invoice_status: varchar("invoice_status", { length: 50 }),
  invoice_payment_method: varchar("invoice_payment_method", { length: 50 }),
  payment_terms: text("payment_terms"),
  invoice_terms_condition: text("invoice_terms_condition"),
  payment_status: varchar("payment_status", { length: 50 }),
  general_tax: integer("general_tax"), // e.g. 18 for 18%
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

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
    price: integer("price").notNull(), // stored in paise/cents; notNull enforced
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

// ─── Relations ────────────────────────────────────────────────────────────────

export const usersRelations = relations(users, ({ many }) => ({
  sessions: many(session),
  accounts: many(account),
  members: many(member),
  invitations: many(invitation),
}));

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(users, {
    fields: [session.userId],
    references: [users.id],
  }),
  member: one(member, {
    fields: [session.userId],
    references: [member.userId],
  }),
}));

export const accountRelations = relations(account, ({ one }) => ({
  user: one(users, {
    fields: [account.userId],
    references: [users.id],
  }),
}));

export const organizationRelations = relations(
  organization,
  ({ many, one }) => ({
    members: many(member),
    invitations: many(invitation),
    products: many(products), // fix: was missing
    generalSetting: one(generalSetting, {
      // fix: was missing
      fields: [organization.id],
      references: [generalSetting.organizationId],
    }),
  }),
);

export const memberRelations = relations(member, ({ one }) => ({
  organization: one(organization, {
    fields: [member.organizationId],
    references: [organization.id],
  }),
  user: one(users, {
    fields: [member.userId],
    references: [users.id],
  }),
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

export const generalSettingRelations = relations(generalSetting, ({ one }) => ({
  organization: one(organization, {
    fields: [generalSetting.organizationId],
    references: [organization.id],
  }),
}));

export const productsRelations = relations(products, ({ one }) => ({
  organization: one(organization, {
    fields: [products.organizationId],
    references: [organization.id],
  }),
}));
