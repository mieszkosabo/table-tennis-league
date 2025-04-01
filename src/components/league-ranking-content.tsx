import { RankingDataTable } from "@/components/ranking-data-table/ranking-table";

export const LeagueRankingContent = ({ leagueId }: { leagueId: string }) => {
  return <RankingDataTable leagueId={leagueId} />;
};
