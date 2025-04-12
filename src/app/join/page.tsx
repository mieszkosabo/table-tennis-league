import { joinLeague } from "@/lib/actions/league";
import { assertLoggedIn } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function JoinPage({
  searchParams,
}: {
  searchParams: Promise<{ joinCode: string }>;
}) {
  await assertLoggedIn();
  const { joinCode } = await searchParams;

  const result = await joinLeague({ joinCode });

  if (!result?.data) {
    return <span>Failed to join</span>;
  }

  const { leagueId } = result.data;

  redirect(`/leagues/${leagueId}`);
}
