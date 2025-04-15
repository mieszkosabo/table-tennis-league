import * as schema from "@/db/schema";
import { env } from "@/env/server";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

const connectionString = env.DATABASE_URL;
const pool = new Pool({
  connectionString,
});

export const db = drizzle(pool, { schema });
export type Db = typeof db;
export type Tx = Parameters<Parameters<Db["transaction"]>[0]>[0];
