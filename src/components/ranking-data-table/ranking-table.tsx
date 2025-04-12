import { DataTable } from "@/components/data-table";
import {
  type RankingData,
  columns,
} from "@/components/ranking-data-table/columns";
import { db } from "@/db/db";
import { playerStats, users } from "@/db/schema";
import { desc, eq } from "drizzle-orm";

async function getData(leagueId: string): Promise<RankingData[]> {
  const data = await db
    .select({
      playerName: users.name,
      elo: playerStats.elo,
      wins: playerStats.wins,
      losses: playerStats.losses,
    })
    .from(playerStats)
    .where(eq(playerStats.leagueId, leagueId))
    .leftJoin(users, eq(playerStats.playerId, users.id))
    .orderBy(desc(playerStats.elo));

  return data.map((p) => {
    const wins = p.wins;
    const losses = p.losses;

    return {
      playerName: p.playerName ?? "Unknown",
      playerElo: p.elo,
      gamesPlayed: wins + losses,
      gamesWon: wins,
      gamesLost: losses,
      winLossPercentage: losses === 0 ? 100 : (wins / (wins + losses)) * 100,
    };
  });
}

export const RankingDataTable = async ({ leagueId }: { leagueId: string }) => {
  const data = await getData(leagueId);

  return <DataTable columns={columns} data={data} />;
};
