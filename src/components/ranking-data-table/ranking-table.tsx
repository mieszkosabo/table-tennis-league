import {
  type RankingData,
  RankingTableWithColumns,
} from "@/components/ranking-data-table/columns";
import { db } from "@/db/db";
import { playerStats, users } from "@/db/schema";
import { assertLoggedIn } from "@/lib/auth";
import { getLeague } from "@/lib/league";
import { desc, eq } from "drizzle-orm";

async function getData(leagueId: string): Promise<RankingData[]> {
  const data = await db
    .select({
      id: users.id,
      playerName: users.name,
      image: users.image,
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
      player: {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        id: p.id!,
        name: p.playerName ?? "Unknown",
        image: p.image ?? undefined,
      },
      playerElo: p.elo,
      gamesPlayed: wins + losses,
      gamesWon: wins,
      gamesLost: losses,
      winLossPercentage: losses === 0 ? 100 : (wins / (wins + losses)) * 100,
    };
  });
}

export const RankingDataTable = async ({ leagueId }: { leagueId: string }) => {
  const { user } = await assertLoggedIn();
  const data = await getData(leagueId);
  const leagueData = await getLeague(leagueId);

  return (
    <RankingTableWithColumns
      currentUserId={user.id}
      leagueId={leagueId}
      players={leagueData?.playersToLeagues.map((p) => p.player) ?? []}
      isLeagueOwner={leagueData?.ownerId === user.id}
      data={data}
    />
  );
};
