import { leagues } from "@/db/schema/leagues";
import { users } from "@/db/schema/users";
import { relations } from "drizzle-orm";
import { integer, pgTable, text, uniqueIndex, uuid } from "drizzle-orm/pg-core";

export const playerStats = pgTable(
  "player_stats",
  {
    id: uuid("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    playerId: text("player_id").references(() => users.id),
    leagueId: uuid("league_id").references(() => leagues.id),

    wins: integer("wins").notNull().default(0),
    losses: integer("losses").notNull().default(0),
    ties: integer("ties").notNull().default(0),
    elo: integer("elo").notNull(),
  },
  (t) => [uniqueIndex("player_league_idx").on(t.playerId, t.leagueId)],
);

export const playerStatsRelations = relations(playerStats, ({ one }) => ({
  player: one(users, {
    fields: [playerStats.playerId],
    references: [users.id],
  }),
  league: one(leagues, {
    fields: [playerStats.leagueId],
    references: [leagues.id],
  }),
}));
