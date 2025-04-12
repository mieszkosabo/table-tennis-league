import { MatchesDataTable } from "@/components/matches-data-table/matches-table";

export const LeagueMatchesContent = ({ leagueId }: { leagueId: string }) => {
  return <MatchesDataTable leagueId={leagueId} />;
};
