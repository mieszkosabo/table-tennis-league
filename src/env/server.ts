import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const IS_DEV = process.env.NODE_ENV === "development";
export const IS_PROD = process.env.NODE_ENV === "production";
export const IS_TEST = process.env.NODE_ENV === "test";

const githubOAuthSchema = z.string().min(1);

export const env = createEnv({
  server: {
    DATABASE_URL: z.string().min(1),
    NEXTAUTH_SECRET: z.string().min(1),
    GITHUB_ID: IS_DEV ? githubOAuthSchema.optional() : githubOAuthSchema,
    GITHUB_SECRET: IS_DEV ? githubOAuthSchema.optional() : githubOAuthSchema,
    FEEDBACK_LINK: z.string().optional(),
  },
  experimental__runtimeEnv: process.env,
});
