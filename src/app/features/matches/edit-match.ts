import { editMatchSchema } from "@/app/features/matches/schemas";
import {
  calculateNewElos,
  createEmptyPlayerStatsMap,
  deserializePlayerStatsMap,
} from "@/app/features/matches/utils";
import type { Tx } from "@/db/db";
import {
  leagueCheckpoints,
  leagues,
  matches,
  playerStats,
  playersToLeagues,
} from "@/db/schema";
import { env } from "@/env/server";
import {
  commandError,
  commandSuccess,
  defineCommand,
  defineModelUpdateFunction,
} from "@/lib/event-sourcing/lib";
import { uuid } from "@/lib/utils";
import { isAfter, subDays } from "date-fns";
import { and, asc, eq, gt, isNotNull } from "drizzle-orm";

export const editMatchCommand = defineCommand("editMatch", {
  inputSchema: editMatchSchema,
  runCommand: async (input, ctx) => {
    const { tx, actorId } = ctx;
    const {
      matchId,
      leagueId,
      player1Id,
      player2Id,
      date,
      winner,
      description,
    } = input;

    // Check if match exists and belongs to the league
    const existingMatch = await tx.query.matches.findFirst({
      where: and(eq(matches.id, matchId), eq(matches.leagueId, leagueId)),
      columns: {
        id: true,
        createdAt: true,
        date: true,
        player1Id: true,
        player2Id: true,
        winner: true,
        description: true,
      },
    });

    if (!existingMatch) {
      return commandError(`Match not found: ${matchId}`);
    }

    // Check grace period
    const gracePeriodDays = env.MATCH_EDITING_GRACE_PERIOD;
    const gracePeriodEnd = subDays(new Date(), gracePeriodDays);

    if (!isAfter(existingMatch.createdAt, gracePeriodEnd)) {
      return commandError(
        `Match cannot be edited. Grace period of ${gracePeriodDays.toString()} days has expired.`,
      );
    }

    // Validate league exists and players are in league (similar to add-match)
    const [leagueData, player1InLeague, player2InLeague] = await Promise.all([
      tx.query.leagues.findFirst({
        where: eq(leagues.id, leagueId),
        columns: {
          id: true,
        },
      }),
      tx.query.playersToLeagues
        .findFirst({
          where: and(
            eq(playersToLeagues.leagueId, leagueId),
            eq(playersToLeagues.playerId, player1Id),
          ),
        })
        .then((result) => !!result),
      tx.query.playersToLeagues
        .findFirst({
          where: and(
            eq(playersToLeagues.leagueId, leagueId),
            eq(playersToLeagues.playerId, player2Id),
          ),
        })
        .then((result) => !!result),
    ]);

    if (!leagueData) {
      return commandError(`League not found: ${leagueId}`);
    }

    if (!player1InLeague) {
      return commandError(
        `Player 1 (${player1Id}) not found in league: ${leagueId}`,
      );
    }
    if (!player2InLeague) {
      return commandError(
        `Player 2 (${player2Id}) not found in league: ${leagueId}`,
      );
    }

    return commandSuccess([
      {
        type: "MatchEdited",
        eventId: uuid(),
        actorId,
        aggregateId: matchId,
        aggregateType: "match",
        createdAt: new Date(),
        data: {
          matchId,
          leagueId,
          matchDate: date,
          player1Id,
          player2Id,
          winnerId: winner,
          description,
          oldMatch: {
            date: existingMatch.date,
            player1Id: existingMatch.player1Id,
            player2Id: existingMatch.player2Id,
            winnerId: existingMatch.winner,
            description: existingMatch.description,
          },
        },
      },
    ]);
  },
});

defineModelUpdateFunction({
  triggeringEvent: "MatchEdited",
  updateFn: async (event, ctx) => {
    const { tx } = ctx;
    const {
      matchId,
      matchDate,
      player1Id,
      player2Id,
      winnerId,
      description,
      leagueId,
    } = event.data;

    // Update the match in the database
    await tx
      .update(matches)
      .set({
        date: matchDate,
        player1Id,
        player2Id,
        winner: winnerId,
        description,
        updatedAt: new Date(),
      })
      .where(eq(matches.id, matchId));

    // Recalculate ELOs for all affected players
    await recalculateStatsFromCheckpoint(leagueId, tx);
  },
});

async function recalculateStatsFromCheckpoint(leagueId: string, tx: Tx) {
  // Get the checkpoint for the league
  const checkpoint = await tx.query.leagueCheckpoints.findFirst({
    where: eq(leagueCheckpoints.leagueId, leagueId),
  });

  const checkpointMatch = !checkpoint
    ? null
    : await tx.query.matches.findFirst({
        where: eq(matches.id, checkpoint.createdAtMatchId),
      });

  const checkpointPlayerStatsMap = checkpoint?.playerStatsMap
    ? deserializePlayerStatsMap(checkpoint.playerStatsMap)
    : createEmptyPlayerStatsMap();

  // Get all matches from checkpoint forward
  const matchesToProcess = await tx.query.matches.findMany({
    where: and(
      checkpointMatch ? gt(matches.date, checkpointMatch.date) : undefined,
      eq(matches.leagueId, leagueId),
      isNotNull(matches.winner),
    ),
    orderBy: asc(matches.date),
    columns: {
      id: true,
      player1Id: true,
      player2Id: true,
      player1Elo: true,
      player2Elo: true,
      winner: true,
      date: true,
    },
  });

  // Initialize current player stats map with checkpoint data
  const currentPlayerStatsMap = new Map(checkpointPlayerStatsMap);

  // Process each match and update complete player stats
  for (const match of matchesToProcess) {
    const player1Stats = currentPlayerStatsMap.get(match.player1Id) || {
      elo: match.player1Elo,
      wins: 0,
      losses: 0,
    };
    const player2Stats = currentPlayerStatsMap.get(match.player2Id) || {
      elo: match.player2Elo,
      wins: 0,
      losses: 0,
    };

    const { player1NewElo, player2NewElo } = calculateNewElos({
      player1Elo: player1Stats.elo,
      player2Elo: player2Stats.elo,
      player1Won: match.winner === match.player1Id,
    });

    // Update complete player stats
    currentPlayerStatsMap.set(match.player1Id, {
      elo: player1NewElo,
      wins:
        match.winner === match.player1Id
          ? player1Stats.wins + 1
          : player1Stats.wins,
      losses:
        match.winner === match.player2Id
          ? player1Stats.losses + 1
          : player1Stats.losses,
    });

    currentPlayerStatsMap.set(match.player2Id, {
      elo: player2NewElo,
      wins:
        match.winner === match.player2Id
          ? player2Stats.wins + 1
          : player2Stats.wins,
      losses:
        match.winner === match.player1Id
          ? player2Stats.losses + 1
          : player2Stats.losses,
    });
  }

  // Update player stats in the database concurrently
  const updatePromises = Array.from(currentPlayerStatsMap.entries()).map(
    ([playerId, stats]) =>
      tx
        .update(playerStats)
        .set({
          elo: stats.elo,
          wins: stats.wins,
          losses: stats.losses,
        })
        .where(
          and(
            eq(playerStats.playerId, playerId),
            eq(playerStats.leagueId, leagueId),
          ),
        ),
  );

  await Promise.all(updatePromises);
}
