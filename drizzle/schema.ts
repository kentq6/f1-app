import { pgTable, uuid, text, index, jsonb, timestamp } from "drizzle-orm/pg-core";

// Define a reusable 'createdAt' timestamp column with default value set to now
const createdAt = timestamp("createdAt").notNull().defaultNow();

// Define a reusable 'updatedAt' timestamp column with automatic update on modification
// const updatedAt = timestamp("updateAt")
//   .notNull()
//   .defaultNow()
//   .$onUpdate(() => new Date())  // automatically updates to current time on update

// UsersTable: stores user's unique Clerk identifiers
export const UsersTable = pgTable(
  "Users",
  {
    id: uuid("id").primaryKey().defaultRandom(), // unique record ID
    clerkUserId: text("clerkUserId").notNull().unique(), // user's Clerk ID (must be unique)
    createdAt, // timestamp when user was created
  },
  (table) => [index("clerkUserIdIndex").on(table.clerkUserId)]
);

// UserFavoriteDriversTable: Each row is a single favorite driver for a user
export const UserFavoriteDriversTable = pgTable(
  "UserFavoriteDrivers",
  {
    id: uuid("id").primaryKey().defaultRandom(), // create a unique identifier
    userId: uuid("userId") // foreign key to the User Table
      .notNull()
      .references(() => UsersTable.id, { onDelete: "cascade" }),
    driverFullName: text("driverFullName").notNull(), // F1 driver number (e.g. "Max VERSTAPPEN", etc.)
    createdAt, // timestamp when user set driver favorite
  },
  (table) => [index("userFavoriteDrivers_userId_idx").on(table.userId)]
);

// UserFavoriteTeamsTable: Each row is a single favorite team for a user
export const UserFavoriteTeamsTable = pgTable(
  "UserFavoriteTeams",
  {
    id: uuid("id").primaryKey().defaultRandom(), // create a unique identifer
    userId: uuid("userId") // foreign key to the User Table
      .notNull()
      .references(() => UsersTable.id, { onDelete: "cascade" }),
    teamName: text("teamName").notNull(), // Team name (e.g. "Red Bull Racing", etc.)
    createdAt, // timestamp when user set team favorite
  },
  (table) => [index("userFavoriteTeams_userId_idx").on(table.userId)]
);

// AISessionInsightsTable: stores AI-generated session insights
export const AISessionInsightsTable = pgTable(
  "AISessionInsights",
  {
    id: uuid("id").primaryKey().defaultRandom(),                // unique record ID for the insight
    sessionKey: text("sessionKey").notNull(),                   // key identifying the session (should be unique per session+context)
    aiType: text("aiType").notNull(),                           // "warning", "info", "success", etc
    aiTitle: text("aiTitle").notNull(),
    aiMessage: text("aiMessage").notNull(),
    aiConfidence: text("aiConfidence").notNull(),               // store as text to support precise values or cast to numeric if preferred
    // Optionally: store the raw AI insight JSON
    aiRaw: jsonb("aiRaw"),
    createdAt,
    // updatedAt,
  },
  (table) => [index("sessionKey_idx").on(table.sessionKey)]
);
