import { serializePlayerStatsMap, createEmptyPlayerStatsMap } from "@/app/features/matches/utils";
import { leagues } from "@/db/schema/leagues";
import { users } from "@/db/schema/users";
import { relations } from "drizzle-orm";
import {
  index,
  integer,
  json,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

export const matches = pgTable(
  "match",
  {
    id: uuid("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    leagueId: uuid("league_id")
      .notNull()
      .references(() => leagues.id, { onDelete: "cascade" }),
    player1Id: text("player1_id")
      .references(() => users.id)
      .notNull(),
    player2Id: text("player2_id")
      .references(() => users.id)
      .notNull(),
    player1Elo: integer("player1_elo").notNull(),
    player2Elo: integer("player2_elo").notNull(),
    winner: text("winner").references(() => users.id, { onDelete: "set null" }),
    score: json("score"),
    description: text("description"),
    date: timestamp("date", { mode: "date", withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", {
      mode: "date",
      withTimezone: true,
    }).notNull(),
    updatedAt: timestamp("updated_at", {
      mode: "date",
      withTimezone: true,
    }).notNull(),
    createdBy: text("created_by").references(() => users.id, {
      onDelete: "set null",
    }),
  },
  (t) => [
    index("match_date_idx").on(t.date),
    index("match_league_id_idx").on(t.leagueId),
    index("match_player1_id_idx").on(t.player1Id),
    index("match_player2_id_idx").on(t.player2Id),
  ],
);

export const matchRelations = relations(matches, ({ one }) => ({
  league: one(leagues, {
    fields: [matches.leagueId],
    references: [leagues.id],
  }),
  player1: one(users, {
    fields: [matches.player1Id],
    references: [users.id],
  }),
  player2: one(users, {
    fields: [matches.player2Id],
    references: [users.id],
  }),
  winner: one(users, {
    fields: [matches.winner],
    references: [users.id],
  }),
  createdBy: one(users, {
    fields: [matches.createdBy],
    references: [users.id],
  }),
}));

export const leagueCheckpoints = pgTable(
  "league_checkpoints",
  {
    id: uuid("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    leagueId: uuid("league_id")
      .notNull()
      .references(() => leagues.id, { onDelete: "cascade" }),
    createdAtMatchId: uuid("created_at_match_id")
      .notNull()
      .references(() => matches.id),
    playerStatsMap: text("player_stats_map").notNull().default(serializePlayerStatsMap(createEmptyPlayerStatsMap())),
  },
  (t) => [uniqueIndex("league_checkpoints_unique_idx").on(t.leagueId)],
);

export const leagueCheckpointsRelations = relations(
  leagueCheckpoints,
  ({ one }) => ({
    league: one(leagues, {
      fields: [leagueCheckpoints.leagueId],
      references: [leagues.id],
    }),
    createdAtMatch: one(matches, {
      fields: [leagueCheckpoints.createdAtMatchId],
      references: [matches.id],
    }),
  }),
);
