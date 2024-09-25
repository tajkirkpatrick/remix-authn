import {
  pgTable,
  text,
  varchar,
  bigint,
  boolean,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { ulid } from "ulid";

export const users = pgTable(
  "users",
  {
    id: text("id")
      .notNull()
      .primaryKey()
      .$defaultFn(() => `user_${ulid()}`),
    username: varchar("username", { length: 255 }).notNull(),
  },
  (table) => ({
    usernameIdx: uniqueIndex("username_idx").on(table.username),
  })
);

export const authenticators = pgTable(
  "authenticators",
  {
    id: text("id")
      .notNull()
      .primaryKey()
      .$defaultFn(() => `auth_${ulid()}`),
    credentialId: text("credential_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id),
    credentialPublicKey: text("credential_public_key").notNull(),
    counter: bigint("counter", { mode: "number" }).notNull(),
    credentialDeviceType: varchar("credential_device_type", {
      length: 32,
    }).notNull(),
    credentialBackedUp: boolean("credential_backed_up").notNull(),
    transports: varchar("transports", { length: 255 }).notNull(),
    aaguid: varchar("aaguid", { length: 36 }).notNull(),
  },
  (table) => ({
    credentialIdIdx: index("credential_id_idx").on(table.credentialId),
    userIdIdx: index("user_id_idx").on(table.userId),
  })
);

export const usersRelations = relations(users, ({ many }) => ({
  authenticators: many(authenticators),
}));

export const authenticatorsRelations = relations(authenticators, ({ one }) => ({
  user: one(users, { fields: [authenticators.userId], references: [users.id] }),
}));

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Authenticator = typeof authenticators.$inferSelect;
export type NewAuthenticator = typeof authenticators.$inferInsert;
