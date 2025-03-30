import { auth } from "@/app/api/auth/auth";
import { createSafeActionClient } from "next-safe-action";

const baseClient = createSafeActionClient();

export const authActionClient = baseClient.use(async ({ next }) => {
  const user = await auth();
  if (!user) {
    throw new Error("Not authenticated");
  }

  return next({
    ctx: { user: user.user },
  });
});
