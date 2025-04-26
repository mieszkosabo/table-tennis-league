import { auth } from "@/app/api/auth/auth";
import { redirect } from "next/navigation";

export const assertLoggedIn = async (args?: { callbackUrl?: string }) => {
  const { callbackUrl } = args ?? {};
  const user = await auth();

  const url = callbackUrl
    ? `/api/auth/signin?${
        callbackUrl
          ? new URLSearchParams({
              callbackUrl,
            })
          : ""
      }`
    : "/api/auth/signin";

  if (!user) {
    redirect(url);
  }

  return user;
};
