ALTER TABLE "league" ADD COLUMN "starting_elo" integer DEFAULT 1000 NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "join_code_idx" ON "league" USING btree ("join_code");--> statement-breakpoint
CREATE INDEX "player_id_idx" ON "players_to_leagues" USING btree ("player_id");--> statement-breakpoint
CREATE INDEX "league_id_idx" ON "players_to_leagues" USING btree ("league_id");