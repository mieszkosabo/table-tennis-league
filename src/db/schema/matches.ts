import { leagues } from "@/db/schema/leagues";
import { users } from "@/db/schema/users";
import { relations } from "drizzle-orm";
import { json, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const matches = pgTable("match", {
  id: uuid("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  leagueId: uuid("league_id")
    .notNull()
    .references(() => leagues.id, { onDelete: "cascade" }),
  player1Id: text("player1_id").references(() => users.id),
  player2Id: text("player2_id").references(() => users.id),
  winner: text("winner").references(() => users.id, { onDelete: "set null" }),
  score: json("score"),
  createdAt: timestamp("created_at", { mode: "date" }),
  updatedAt: timestamp("updated_at", { mode: "date" }),
  createdBy: text("created_by").references(() => users.id, {
    onDelete: "set null",
  }),
});

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
