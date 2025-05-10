import { LeagueTabsData } from "@/app/leagues/[leagueId]/tabs";
import { assertLoggedIn } from "@/lib/auth";

export default async function LeaguesMatchesPage({
  params,
  searchParams,
}: {
  params: Promise<{ leagueId: string }>;
  searchParams: Promise<{ [key: string]: string | string[] }>;
}) {
  await assertLoggedIn();
  const { leagueId } = await params;
  const { pastMatchesPage, scheduledMatchesPage } = await searchParams;

  return (
    <LeagueTabsData
      value="matches"
      leagueId={leagueId}
      pastMatchesPageIndex={
        pastMatchesPage ? Number.parseInt(pastMatchesPage as string) : 0
      }
      scheduledMatchesPageIndex={
        scheduledMatchesPage
          ? Number.parseInt(scheduledMatchesPage as string)
          : 0
      }
    />
  );
}
