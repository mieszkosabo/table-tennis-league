import { CreateMatchButton } from "@/components/create-match-button";
import { LeagueMatchesContent } from "@/components/league-matches-content";
import { LeagueRankingContent } from "@/components/league-ranking-content";
import { LeagueTabs } from "@/components/league-tabs";
import { getLeague } from "@/lib/league";

export async function LeagueTabsData({
  leagueId,
  value,
}: {
  leagueId: string;
  value: "ranking" | "matches";
}) {
  const leagueData = await getLeague(leagueId);

  if (!leagueData) {
    return null;
  }

  return (
    <LeagueTabs
      value={value}
      leagueId={leagueId}
      rankingContent={<LeagueRankingContent leagueId={leagueId} />}
      matchesContent={<LeagueMatchesContent leagueId={leagueId} />}
      createMatchButton={
        <CreateMatchButton
          players={leagueData.playersToLeagues.map((p) => p.player)}
          leagueId={leagueId}
        />
      }
    />
  );
}
