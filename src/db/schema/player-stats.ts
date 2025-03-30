import { leagues } from "@/db/schema/leagues";
import { users } from "@/db/schema/users";
import { relations } from "drizzle-orm";
import { integer, pgTable, text, uuid } from "drizzle-orm/pg-core";

// TODO: default player stats should be created upon adding someone to a league

export const playerStats = pgTable("player_stats", {
  id: uuid("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  playerId: text("player_id").references(() => users.id),
  leagueId: uuid("league_id").references(() => leagues.id),

  wins: integer("wins"),
  losses: integer("losses"),
  ties: integer("ties"),
  elo: integer("elo"),
});

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
