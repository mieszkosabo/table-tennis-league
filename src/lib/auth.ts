import { auth } from "@/app/api/auth/auth";
import { redirect } from "next/navigation";

export const assertLoggedIn = async () => {
  const user = await auth();

  if (!user) {
    redirect("/api/auth/signin");
  }

  return user;
};
