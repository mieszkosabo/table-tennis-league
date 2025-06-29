ALTER TABLE "league_checkpoints" ADD COLUMN "player_stats_map" text DEFAULT '{}' NOT NULL;--> statement-breakpoint
ALTER TABLE "league_checkpoints" DROP COLUMN "elo_map";