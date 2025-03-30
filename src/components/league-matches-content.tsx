import { getLeague } from "@/lib/league";

export const LeagueMatchesContent = async ({
  leagueId,
}: {
  leagueId: string;
}) => {
  const leagueData = await getLeague(leagueId);
  if (!leagueData) {
    return null;
  }

  return <pre>{JSON.stringify(leagueData, null, 2)}</pre>;
};
