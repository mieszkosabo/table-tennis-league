import { RankingDataTable } from "@/components/ranking-data-table/ranking-table";

export const LeagueRankingContent = ({
  leagueId,
  pageIndex,
}: { leagueId: string; pageIndex: number }) => {
  return <RankingDataTable leagueId={leagueId} pageIndex={pageIndex} />;
};
