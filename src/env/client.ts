import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  client: {
    NEXT_PUBLIC_MATCH_EDITING_GRACE_PERIOD: z.number().int().optional().default(7),
  },
  // all client env vars must be deconstructed from process.env here
  runtimeEnv: {
    NEXT_PUBLIC_MATCH_EDITING_GRACE_PERIOD: process.env.NEXT_PUBLIC_MATCH_EDITING_GRACE_PERIOD ? parseInt(process.env.NEXT_PUBLIC_MATCH_EDITING_GRACE_PERIOD) : 7,
  },
});
