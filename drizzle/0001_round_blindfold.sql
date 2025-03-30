CREATE TABLE "league" (
	"id" uuid PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp,
	"updated_at" timestamp,
	"owner_id" text,
	"join_code" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "players_to_leagues" (
	"player_id" text NOT NULL,
	"league_id" uuid NOT NULL,
	"joined_at" timestamp,
	CONSTRAINT "players_to_leagues_player_id_league_id_pk" PRIMARY KEY("player_id","league_id")
);
--> statement-breakpoint
CREATE TABLE "match" (
	"id" uuid PRIMARY KEY NOT NULL,
	"league_id" uuid NOT NULL,
	"player1_id" text,
	"player2_id" text,
	"winner" text,
	"score" json,
	"created_at" timestamp,
	"updated_at" timestamp,
	"created_by" text
);
--> statement-breakpoint
CREATE TABLE "player_stats" (
	"id" uuid PRIMARY KEY NOT NULL,
	"player_id" text,
	"league_id" uuid,
	"wins" integer,
	"losses" integer,
	"ties" integer,
	"elo" integer
);
--> statement-breakpoint
ALTER TABLE "league" ADD CONSTRAINT "league_owner_id_user_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "players_to_leagues" ADD CONSTRAINT "players_to_leagues_player_id_user_id_fk" FOREIGN KEY ("player_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "players_to_leagues" ADD CONSTRAINT "players_to_leagues_league_id_league_id_fk" FOREIGN KEY ("league_id") REFERENCES "public"."league"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "match" ADD CONSTRAINT "match_league_id_league_id_fk" FOREIGN KEY ("league_id") REFERENCES "public"."league"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "match" ADD CONSTRAINT "match_player1_id_user_id_fk" FOREIGN KEY ("player1_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "match" ADD CONSTRAINT "match_player2_id_user_id_fk" FOREIGN KEY ("player2_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "match" ADD CONSTRAINT "match_winner_user_id_fk" FOREIGN KEY ("winner") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "match" ADD CONSTRAINT "match_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "player_stats" ADD CONSTRAINT "player_stats_player_id_user_id_fk" FOREIGN KEY ("player_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "player_stats" ADD CONSTRAINT "player_stats_league_id_league_id_fk" FOREIGN KEY ("league_id") REFERENCES "public"."league"("id") ON DELETE no action ON UPDATE no action;