import { auth } from "@/app/api/auth/auth";
import {
  JOIN_CODE_COOKIE_KEY,
  SHOULD_REDIRECT_COOKIE_KEY,
} from "@/app/join/consts";
import { joinLeague } from "@/lib/actions/league";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function JoinPage({
  searchParams,
}: {
  searchParams: Promise<{ joinCode: string }>;
}) {
  const { joinCode } = await searchParams;
  const cookieStore = await cookies();
  const user = await auth();
  if (!user) {
    cookieStore.set(SHOULD_REDIRECT_COOKIE_KEY, "true");
    cookieStore.set(JOIN_CODE_COOKIE_KEY, joinCode);
    redirect("/api/auth/signin");
  }

  const result = await joinLeague({ joinCode });

  if (!result?.data) {
    return <span>Failed to join</span>;
  }

  const { leagueId } = result.data;

  redirect(`/leagues/${leagueId}`);
}
