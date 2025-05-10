import { DEFAULT_PAGE_SIZE } from "@/components/data-table/consts";
import {
  type RankingData,
  RankingTableWithColumns,
} from "@/components/ranking-data-table/columns";
import { db } from "@/db/db";
import { playerStats, users } from "@/db/schema";
import { assertLoggedIn } from "@/lib/auth";
import { getLeague } from "@/lib/league";
import { desc, eq, sql } from "drizzle-orm";

async function getData({
  leagueId,
  pageIndex,
}: { leagueId: string; pageIndex: number }): Promise<{
  data: RankingData[];
  totalCount: number;
}> {
  const data = await db
    .select({
      id: users.id,
      playerName: users.name,
      image: users.image,
      elo: playerStats.elo,
      wins: playerStats.wins,
      losses: playerStats.losses,

      totalCount: sql<number>`count(*) over()`,
    })
    .from(playerStats)
    .where(eq(playerStats.leagueId, leagueId))
    .leftJoin(users, eq(playerStats.playerId, users.id))
    .orderBy(desc(playerStats.elo))
    .limit(DEFAULT_PAGE_SIZE)
    .offset(pageIndex * DEFAULT_PAGE_SIZE);

  return {
    data: data.map((p) => {
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
    }),
    totalCount: data[0]?.totalCount ?? 0,
  };
}

export const RankingDataTable = async ({
  leagueId,
  pageIndex,
}: { leagueId: string; pageIndex: number }) => {
  const { user } = await assertLoggedIn();
  const { data, totalCount } = await getData({ leagueId, pageIndex });
  const leagueData = await getLeague(leagueId);

  return (
    <RankingTableWithColumns
      currentUserId={user.id}
      leagueId={leagueId}
      players={leagueData?.playersToLeagues.map((p) => p.player) ?? []}
      isLeagueOwner={leagueData?.ownerId === user.id}
      data={data}
      totalCount={totalCount}
      pageIndex={pageIndex}
    />
  );
};
