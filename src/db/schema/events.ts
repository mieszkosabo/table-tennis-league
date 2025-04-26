import { jsonb, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const events = pgTable("event", {
  id: uuid("id").primaryKey(),
  type: text("type").notNull(),
  data: jsonb("data"),
  actorId: text("actor_id").notNull(),
  aggregateId: text("aggregate_id").notNull(),
  aggregateType: text("aggregate_type").notNull(),
  createdAt: timestamp("created_at", { mode: "date" }),
});
