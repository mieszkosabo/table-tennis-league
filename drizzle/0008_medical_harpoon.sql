CREATE TABLE "event" (
	"id" uuid PRIMARY KEY NOT NULL,
	"type" text NOT NULL,
	"data" jsonb,
	"actor_id" text NOT NULL,
	"aggregate_id" text NOT NULL,
	"aggregate_type" text NOT NULL,
	"created_at" timestamp
);
