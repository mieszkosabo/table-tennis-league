import { LeagueTabsData } from "@/app/leagues/[leagueId]/tabs";
import { assertLoggedIn } from "@/lib/auth";

export default async function LeaguesRankingPage({
  params,
  searchParams,
}: {
  params: Promise<{ leagueId: string }>;
  searchParams: Promise<{ [key: string]: string | string[] }>;
}) {
  await assertLoggedIn();
  const { leagueId } = await params;
  const { page } = await searchParams;

  return (
    <LeagueTabsData
      value="ranking"
      leagueId={leagueId}
      pageIndex={page ? Number.parseInt(page as string) : 0}
    />
  );
}
