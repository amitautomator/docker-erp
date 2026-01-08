import {
  integer,
  pgTable,
  varchar,
  uuid,
  timestamp,
  date,
  boolean,
  pgEnum,
  index,
  text,
} from "drizzle-orm/pg-core";

import { relations } from "drizzle-orm";

// Define roles enum
export const rolesEnum = pgEnum("roles", ["user", "manager", "admin", "owner"]);

const timestamps = {
  updated_at: timestamp().defaultNow().notNull(),
  created_at: timestamp().defaultNow().notNull(),
};

export const organizationsTable = pgTable("organizations", {
  id: uuid().primaryKey().defaultRandom(),
  orgName: varchar({ length: 255 }).notNull(),
  business_type: varchar({ length: 255 }),
  city: varchar({ length: 255 }),
  is_active: boolean().default(true).notNull(),
  description: varchar({ length: 1024 }),
  team_size: integer(),
  logo_url: varchar({ length: 512 }),
  ...timestamps,
  created_by: uuid().notNull(),
});

export const user = pgTable(
  "user",
  {
    // Better Auth required fields
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    email: text("email").notNull().unique(),
    emailVerified: boolean("email_verified").default(false).notNull(),
    image: text("image"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),

    // Your custom fields (migrated from usersTable)
    organizationId: uuid("organization_id").references(
      () => organizationsTable.id
    ),
    phone: varchar("phone", { length: 20 }),
    googleId: varchar("google_id", { length: 255 }).unique(),
    dob: date("dob", { mode: "date" }),
    doj: date("doj", { mode: "date" }),
    role: rolesEnum("role").default("owner").notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    status: varchar("status", { length: 512 }),
    transferDate: date("transfer_date", { mode: "date" }),
    transferReason: varchar("transfer_reason", { length: 1024 }),
    subscriptionType: varchar("subscription_type", { length: 100 }),
    subscriptionStartedAt: timestamp("subscription_started_at"),
    subscriptionExpiresAt: timestamp("subscription_expires_at"),
    subscriptionStatus: varchar("subscription_status", { length: 100 }),
  },
  (table) => ({
    roleIdx: index("users_role_idx").on(table.role),
    activeIdx: index("users_active_idx").on(table.isActive),
    createdAtIdx: index("users_created_at_idx").on(table.createdAt),
    activeRoleIdx: index("users_active_role_idx").on(
      table.isActive,
      table.role
    ),
  })
);

export const session = pgTable(
  "session",
  {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expires_at").notNull(),
    token: text("token").notNull().unique(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => new Date())
      .notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  },
  (table) => [index("session_userId_idx").on(table.userId)]
);

export const account = pgTable(
  "account",
  {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at"),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
    scope: text("scope"),
    password: text("password"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index("account_userId_idx").on(table.userId)]
);

export const verification = pgTable(
  "verification",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index("verification_identifier_idx").on(table.identifier)]
);

// Relations
export const userRelations = relations(user, ({ many }) => ({
  sessions: many(session),
  accounts: many(account),
}));

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}));

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
}));
