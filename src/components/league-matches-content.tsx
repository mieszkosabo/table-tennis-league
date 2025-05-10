import { MatchesDataTable } from "@/components/matches-data-table/matches-table";

export const LeagueMatchesContent = ({
  leagueId,
  scheduledMatchesPageIndex,
  pastMatchesPageIndex,
}: {
  leagueId: string;
  scheduledMatchesPageIndex: number;
  pastMatchesPageIndex: number;
}) => {
  return (
    <MatchesDataTable
      leagueId={leagueId}
      scheduledMatchesPageIndex={scheduledMatchesPageIndex}
      pastMatchesPageIndex={pastMatchesPageIndex}
    />
  );
};
