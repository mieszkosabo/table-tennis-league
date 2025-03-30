import { users } from "@/db/schema/users";
import { relations } from "drizzle-orm";
import {
  index,
  integer,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

export const leagues = pgTable(
  "league",
  {
    id: uuid("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    name: text("name").notNull(),
    createdAt: timestamp("created_at", { mode: "date" }),
    updatedAt: timestamp("updated_at", { mode: "date" }),
    ownerId: text("owner_id").references(() => users.id, {
      onDelete: "set null",
    }),
    joinCode: text("join_code").notNull(),
    startingElo: integer("starting_elo").notNull().default(1000),
  },
  (table) => [uniqueIndex("join_code_idx").on(table.joinCode)],
);

export const leagueRelations = relations(leagues, ({ one, many }) => ({
  owner: one(users, {
    fields: [leagues.ownerId],
    references: [users.id],
  }),
  playersToLeagues: many(playersToLeagues),
}));

export const playersToLeagues = pgTable(
  "players_to_leagues",
  {
    playerId: text("player_id")
      .notNull()
      .references(() => users.id),
    leagueId: uuid("league_id")
      .notNull()
      .references(() => leagues.id),
    joinedAt: timestamp("joined_at", { mode: "date" }),
  },
  (t) => [
    primaryKey({ columns: [t.playerId, t.leagueId] }),
    index("player_id_idx").on(t.playerId),
    index("league_id_idx").on(t.leagueId),
  ],
);

export const playersToLeaguesRelations = relations(
  playersToLeagues,
  ({ one }) => ({
    player: one(users, {
      fields: [playersToLeagues.playerId],
      references: [users.id],
    }),
    league: one(leagues, {
      fields: [playersToLeagues.leagueId],
      references: [leagues.id],
    }),
  }),
);
