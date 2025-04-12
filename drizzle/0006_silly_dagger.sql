CREATE TABLE "league_checkpoints" (
	"id" uuid PRIMARY KEY NOT NULL,
	"league_id" uuid NOT NULL,
	"created_at_match_id" uuid NOT NULL,
	"elo_map" json DEFAULT '{}' NOT NULL
);
--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "email" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "match" ALTER COLUMN "player1_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "match" ALTER COLUMN "player2_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "match" ADD COLUMN "player1_elo" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "match" ADD COLUMN "player2_elo" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "match" ADD COLUMN "date" timestamp NOT NULL;--> statement-breakpoint
ALTER TABLE "league_checkpoints" ADD CONSTRAINT "league_checkpoints_league_id_league_id_fk" FOREIGN KEY ("league_id") REFERENCES "public"."league"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "league_checkpoints" ADD CONSTRAINT "league_checkpoints_created_at_match_id_match_id_fk" FOREIGN KEY ("created_at_match_id") REFERENCES "public"."match"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "league_checkpoints_unique_idx" ON "league_checkpoints" USING btree ("league_id");--> statement-breakpoint
CREATE INDEX "match_date_idx" ON "match" USING btree ("date");--> statement-breakpoint
CREATE INDEX "match_league_id_idx" ON "match" USING btree ("league_id");--> statement-breakpoint
CREATE INDEX "match_player1_id_idx" ON "match" USING btree ("player1_id");--> statement-breakpoint
CREATE INDEX "match_player2_id_idx" ON "match" USING btree ("player2_id");--> statement-breakpoint
CREATE UNIQUE INDEX "player_league_idx" ON "player_stats" USING btree ("player_id","league_id");