import { createEnv } from "@t3-oss/env-nextjs";

export const env = createEnv({
  client: {},
  // all client env vars must be deconstructed from process.env here
  runtimeEnv: {},
});
