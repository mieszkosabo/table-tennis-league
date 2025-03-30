ALTER TABLE "player_stats" ALTER COLUMN "wins" SET DEFAULT 0;--> statement-breakpoint
ALTER TABLE "player_stats" ALTER COLUMN "wins" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "player_stats" ALTER COLUMN "losses" SET DEFAULT 0;--> statement-breakpoint
ALTER TABLE "player_stats" ALTER COLUMN "losses" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "player_stats" ALTER COLUMN "ties" SET DEFAULT 0;--> statement-breakpoint
ALTER TABLE "player_stats" ALTER COLUMN "ties" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "player_stats" ALTER COLUMN "elo" SET NOT NULL;