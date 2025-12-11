import { sql } from "drizzle-orm";
import { pgTable, uuid, text, index } from "drizzle-orm/pg-core";

// Define a reusable 'createdAt' timestamp column with default value set to now
// const createdAt = timestamp("createdAt").notNull().defaultNow();

// Define a reusable 'updatedAt' timestamp column with automatic update on modification
// const updatedAt = timestamp("updateAt")
//   .notNull()
//   .defaultNow()
//   .$onUpdate(() => new Date())  // automatically updates to current time on update

// UserFavoritesTable: stores user's favorite F1 drivers
export const UserFavoritesTable = pgTable(
  "userFavorites",
  {
    id: uuid("id").primaryKey().defaultRandom(), // unique record ID
    clerkUserId: text("clerkUserId").notNull().unique(), // user's Clerk ID (must be unique)
    // favoriteDrivers: text("favoriteDrivers"), // stringified array of driver IDs (e.g. '[ "VER", "LEC", "HAM" ]')
    favoriteDrivers: text("favoriteDrivers")
      .array()
      .default(sql`'{}'::text[]`), // stringified array of driver IDs (e.g. '[ "VER", "LEC", "HAM" ]')
    favoriteTeams: text("favoriteTeams")
      .array()
      .default(sql`'{}'::text[]`), // stringigied array of team names (e.g. '[Red Bull Racing, Ferrari, Ferrari]')
  },
  (table) => [index("clerkUserIdIndex").on(table.clerkUserId)]
);

// Define the reverse relation: each availability belongs to a schedule
// export const ScheduleAvailabilityRelations = relations(
//   ScheduleAvailabilityTable,
//   ({ one }) => ({
//     schedule: one(ScheduleTable, {
//       fields: [ScheduleAvailabilityTable.scheduleId], // local key
//       references: [ScheduleTable.id], // foreign key
//     })
//   })
// );
