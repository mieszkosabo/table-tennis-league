import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const IS_DEV = process.env.NODE_ENV === "development";
export const IS_PROD = process.env.NODE_ENV === "production";
export const IS_TEST = process.env.NODE_ENV === "test";

const nonEmptyStringSchema = z.string().min(1);

export const env = createEnv({
  server: {
    DATABASE_URL: z.string().min(1),
    NEXTAUTH_SECRET: z.string().min(1),
    FEEDBACK_LINK: z.string().optional(),

    GITHUB_ID: IS_DEV ? nonEmptyStringSchema.optional() : nonEmptyStringSchema,
    GITHUB_SECRET: IS_DEV
      ? nonEmptyStringSchema.optional()
      : nonEmptyStringSchema,

    GOOGLE_ID: IS_DEV ? nonEmptyStringSchema.optional() : nonEmptyStringSchema,
    GOOGLE_SECRET: IS_DEV
      ? nonEmptyStringSchema.optional()
      : nonEmptyStringSchema,

    MATCH_EDITING_GRACE_PERIOD: z.number().int().optional().default(7),
  },
  experimental__runtimeEnv: process.env,
});
