import { getLeague } from "@/lib/league";

export const LeagueRankingContent = async ({
  leagueId,
}: {
  leagueId: string;
}) => {
  const leagueData = await getLeague(leagueId);
  if (!leagueData) {
    return null;
  }

  // implement with this: https://ui.shadcn.com/docs/components/data-table
  return <pre>{JSON.stringify(leagueData, null, 2)}</pre>;
};
