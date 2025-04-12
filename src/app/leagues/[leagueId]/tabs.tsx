import { AddMatchButton } from "@/components/add-match-button";
import { LeagueMatchesContent } from "@/components/league-matches-content";
import { LeagueRankingContent } from "@/components/league-ranking-content";
import { LeagueTabs } from "@/components/league-tabs";
import { assertLoggedIn } from "@/lib/auth";
import { getLeague } from "@/lib/league";

export async function LeagueTabsData({
  leagueId,
  value,
}: {
  leagueId: string;
  value: "ranking" | "matches";
}) {
  const { user } = await assertLoggedIn();
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
        <AddMatchButton
          players={leagueData.playersToLeagues.map((p) => p.player)}
          leagueId={leagueId}
          userId={user.id}
        />
      }
    />
  );
}
