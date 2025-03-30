import { LeagueTabsData } from "@/app/leagues/[leagueId]/tabs";
import { assertLoggedIn } from "@/lib/auth";

export default async function LeaguesRankingPage({
  params,
}: {
  params: Promise<{ leagueId: string }>;
}) {
  await assertLoggedIn();
  const { leagueId } = await params;

  return <LeagueTabsData value="ranking" leagueId={leagueId} />;
}
