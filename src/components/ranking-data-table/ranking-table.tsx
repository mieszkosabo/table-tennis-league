import { DataTable } from "@/components/data-table";
import {
  type RankingData,
  columns,
} from "@/components/ranking-data-table/columns";
import { getLeague } from "@/lib/league";

async function getData(leagueId: string): Promise<RankingData[]> {
  const data = await getLeague(leagueId);

  if (!data) {
    return [];
  }

  return data.playersToLeagues.map((p) => {
    const wins = p.player.playerToStats.wins;
    const losses = p.player.playerToStats.losses;

    return {
      playerName: p.player.name ?? "Unknown",
      playerElo: p.player.playerToStats.elo,
      gamesPlayed: wins + losses,
      gamesWon: wins,
      gamesLost: losses,
      winLossPercentage: losses === 0 ? 0 : (wins / losses) * 100,
    };
  });
}

export const RankingDataTable = async ({ leagueId }: { leagueId: string }) => {
  const data = await getData(leagueId);

  return <DataTable columns={columns} data={data} />;
};
