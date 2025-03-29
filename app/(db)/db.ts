import * as schema from "@/app/(db)/schema";
import { env } from "@/app/(env)/server";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

const connectionString = env.DATABASE_URL;
const pool = new Pool({
  connectionString,
});

export const db = drizzle(pool, { schema });
