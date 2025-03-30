import { LeagueMatchesContent } from "@/components/league-matches-content";
import { LeagueRankingContent } from "@/components/league-ranking-content";
import { LeagueTabs } from "@/components/league-tabs";

export function LeagueTabsData({
  leagueId,
  value,
}: {
  leagueId: string;
  value: "ranking" | "matches";
}) {
  return (
    <LeagueTabs
      value={value}
      leagueId={leagueId}
      rankingContent={<LeagueRankingContent leagueId={leagueId} />}
      matchesContent={<LeagueMatchesContent leagueId={leagueId} />}
    />
  );
}
