import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    DATABASE_URL: z.string().min(1),
    NEXTAUTH_SECRET: z.string().min(1),
    GITHUB_ID: z.string().min(1),
    GITHUB_SECRET: z.string().min(1),
    AUTH_DRIZZLE_URL: z.string().min(1),
  },
  experimental__runtimeEnv: process.env,
});
