import {
  CREATE_LEAGUE_DEFAULTS,
  CREATE_LEAGUE_LIMITS,
} from "@/app/features/create-league/consts";
import { leagueCheckpoints } from "@/db/schema/matches";
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
  varchar,
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
    startingElo: integer("starting_elo")
      .notNull()
      .default(CREATE_LEAGUE_DEFAULTS.startingElo),
    description: varchar("description", {
      length: CREATE_LEAGUE_LIMITS.MAX_LEAGUE_DESCRIPTION_LENGTH,
    }).default(CREATE_LEAGUE_DEFAULTS.description),
  },
  (table) => [uniqueIndex("join_code_idx").on(table.joinCode)],
);

export const leagueRelations = relations(leagues, ({ one, many }) => ({
  owner: one(users, {
    fields: [leagues.ownerId],
    references: [users.id],
  }),
  playersToLeagues: many(playersToLeagues),
  eloCheckpoint: one(leagueCheckpoints, {
    fields: [leagues.id],
    references: [leagueCheckpoints.leagueId],
  }),
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
