import { AddMatchButton } from "@/components/add-match-button";
import { LeagueMatchesContent } from "@/components/league-matches-content";
import { LeagueRankingContent } from "@/components/league-ranking-content";
import { LeagueTabs } from "@/components/league-tabs";
import { assertLoggedIn } from "@/lib/auth";
import { getLeague } from "@/lib/league";

export async function LeagueTabsData(
  props: {
    leagueId: string;
  } & (
    | {
        value: "ranking";
        pageIndex: number;
      }
    | {
        value: "matches";
        scheduledMatchesPageIndex: number;
        pastMatchesPageIndex: number;
      }
  ),
) {
  const { user } = await assertLoggedIn();
  const leagueData = await getLeague(props.leagueId);

  if (!leagueData) {
    return null;
  }

  return (
    <LeagueTabs
      value={props.value}
      leagueId={props.leagueId}
      rankingContent={
        props.value === "ranking" ? (
          <LeagueRankingContent
            pageIndex={props.pageIndex}
            leagueId={props.leagueId}
          />
        ) : null
      }
      matchesContent={
        props.value === "matches" ? (
          <LeagueMatchesContent
            scheduledMatchesPageIndex={props.scheduledMatchesPageIndex}
            pastMatchesPageIndex={props.pastMatchesPageIndex}
            leagueId={props.leagueId}
          />
        ) : null
      }
      createMatchButton={
        <AddMatchButton
          players={leagueData.playersToLeagues.map((p) => p.player)}
          leagueId={props.leagueId}
          userId={user.id}
        />
      }
    />
  );
}
