import { auth } from "@/app/api/auth/auth";
import { AppError } from "@/lib/event-sourcing/lib";
import {
  DEFAULT_SERVER_ERROR_MESSAGE,
  createSafeActionClient,
} from "next-safe-action";

const baseClient = createSafeActionClient({
  handleServerError: (e) => {
    console.error("Action error: ", e);

    if (e instanceof AppError) {
      return e.message;
    }

    return DEFAULT_SERVER_ERROR_MESSAGE;
  },
});

export const authActionClient = baseClient.use(async ({ next }) => {
  const user = await auth();
  if (!user) {
    throw new Error("Not authenticated");
  }

  return next({
    ctx: { user: user.user },
  });
});
