import { DataTable } from "@/components/data-table";
import {
  type MatchesData,
  columns,
} from "@/components/matches-data-table/columns";
import { VStack } from "@/components/ui/stack";
import { db } from "@/db/db";
import { matches, users } from "@/db/schema";
import { aliasedTable, desc, eq } from "drizzle-orm";

async function getData(leagueId: string): Promise<MatchesData[]> {
  const player1Table = aliasedTable(users, "player1");
  const player2Table = aliasedTable(users, "player2");

  const data = await db
    .select({
      winner: matches.winner,
      player1: {
        id: matches.player1Id,
        name: player1Table.name,
        email: player1Table.email,
        image: player1Table.image,
      },
      player2: {
        id: matches.player2Id,
        name: player2Table.name,
        email: player2Table.email,
        image: player2Table.image,
      },
      matchDate: matches.createdAt,
      player1OldElo: matches.player1Elo,
      player2OldElo: matches.player2Elo,
    })
    .from(matches)
    .where(eq(matches.leagueId, leagueId))
    .leftJoin(player1Table, eq(matches.player1Id, player1Table.id))
    .leftJoin(player2Table, eq(matches.player2Id, player2Table.id))
    .orderBy(desc(matches.createdAt));

  return data.map((match) => ({
    ...match,
    player1: {
      ...match.player1,
      name: match.player1.name ?? match.player1.email ?? "Unknown",
      isWinner: match.winner === match.player1.id,
      image: match.player1.image ?? undefined,
    },
    player2: {
      ...match.player2,
      name: match.player2.name ?? match.player2.email ?? "Unknown",
      isWinner: match.winner === match.player2.id,
      image: match.player2.image ?? undefined,
    },
  }));
}

export const MatchesDataTable = async ({ leagueId }: { leagueId: string }) => {
  const data = await getData(leagueId);

  const scheduledMatches = data.filter(
    (match) => !match.player1.isWinner && !match.player2.isWinner,
  );
  const pastMatches = data.filter(
    (match) => match.player1.isWinner || match.player2.isWinner,
  );

  return (
    <VStack className="gap-16">
      <VStack className="gap-4">
        <h2 className="text-3xl font-bold text-slate-700 dark:text-slate-100">
          Scheduled matches 🍿
        </h2>
        <DataTable
          className="bg-slate-50 dark:bg-slate-950"
          columns={columns}
          data={scheduledMatches}
        />
      </VStack>

      <VStack className="gap-4">
        <h2 className="text-3xl font-bold text-slate-700 dark:text-slate-100">
          Past matches
        </h2>
        <DataTable columns={columns} data={pastMatches} />
      </VStack>
    </VStack>
  );
};
