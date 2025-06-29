import { DEFAULT_PAGE_SIZE } from "@/components/data-table/consts";
import {
  type MatchesData,
  MatchesTableWithColumns,
} from "@/components/matches-data-table/columns";
import { VStack } from "@/components/ui/stack";
import { db } from "@/db/db";
import { matches, users } from "@/db/schema";
import {
  aliasedTable,
  and,
  desc,
  eq,
  isNotNull,
  isNull,
  sql,
} from "drizzle-orm";

async function getData({
  leagueId,
  scheduledMatchesPageIndex,
  pastMatchesPageIndex,
}: {
  leagueId: string;
  scheduledMatchesPageIndex: number;
  pastMatchesPageIndex: number;
}): Promise<{
  scheduledMatches: {
    data: MatchesData[];
    totalCount: number;
  };
  pastMatches: {
    data: MatchesData[];
    totalCount: number;
  };
}> {
  const player1Table = aliasedTable(users, "player1");
  const player2Table = aliasedTable(users, "player2");

  const [scheduledMatches, pastMatches] = await Promise.all([
    db
      .select({
        matchId: matches.id,
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
        matchDate: matches.date,
        player1OldElo: matches.player1Elo,
        player2OldElo: matches.player2Elo,
        createdAt: matches.createdAt,
        // description: matches.description,

        totalCount: sql<number>`count(*) over()`,
      })
      .from(matches)
      .where(and(eq(matches.leagueId, leagueId), isNull(matches.winner)))
      .leftJoin(player1Table, eq(matches.player1Id, player1Table.id))
      .leftJoin(player2Table, eq(matches.player2Id, player2Table.id))
      .orderBy(desc(matches.date))
      .limit(DEFAULT_PAGE_SIZE)
      .offset(scheduledMatchesPageIndex * DEFAULT_PAGE_SIZE),

    db
      .select({
        matchId: matches.id,
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
        matchDate: matches.date,
        player1OldElo: matches.player1Elo,
        player2OldElo: matches.player2Elo,
        createdAt: matches.createdAt,
        // description: matches.description,

        totalCount: sql<number>`count(*) over()`,
      })
      .from(matches)
      .where(and(eq(matches.leagueId, leagueId), isNotNull(matches.winner)))
      .leftJoin(player1Table, eq(matches.player1Id, player1Table.id))
      .leftJoin(player2Table, eq(matches.player2Id, player2Table.id))
      .orderBy(desc(matches.date))
      .limit(DEFAULT_PAGE_SIZE)
      .offset(pastMatchesPageIndex * DEFAULT_PAGE_SIZE),
  ]);

  return {
    scheduledMatches: {
      data: scheduledMatches.map((match) => ({
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
      })),
      totalCount: scheduledMatches[0]?.totalCount ?? 0,
    },
    pastMatches: {
      data: pastMatches.map((match) => ({
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
      })),
      totalCount: pastMatches[0]?.totalCount ?? 0,
    },
  };
}

export const MatchesDataTable = async ({
  leagueId,
  scheduledMatchesPageIndex,
  pastMatchesPageIndex,
}: {
  leagueId: string;
  scheduledMatchesPageIndex: number;
  pastMatchesPageIndex: number;
}) => {
  const { scheduledMatches, pastMatches } = await getData({
    leagueId,
    scheduledMatchesPageIndex,
    pastMatchesPageIndex,
  });

  return (
    <VStack className="gap-16">
      <VStack className="gap-4">
        <h2 className="text-3xl font-bold text-slate-700 dark:text-slate-100">
          Scheduled matches 🍿
        </h2>
        <MatchesTableWithColumns
          leagueId={leagueId}
          data={scheduledMatches.data}
          totalCount={scheduledMatches.totalCount}
          className="bg-slate-50 dark:bg-slate-950"
          paginationParam="scheduledMatchesPage"
        />
      </VStack>

      <VStack className="gap-4">
        <h2 className="text-3xl font-bold text-slate-700 dark:text-slate-100">
          Past matches
        </h2>
        <MatchesTableWithColumns
          leagueId={leagueId}
          data={pastMatches.data}
          totalCount={pastMatches.totalCount}
          paginationParam="pastMatchesPage"
        />
      </VStack>
    </VStack>
  );
};
