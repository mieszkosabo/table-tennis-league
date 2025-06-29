import type { Tx } from "@/db/db";
import {
  leagueCheckpoints,
  leagues,
  matches,
  playerStats,
  playersToLeagues,
} from "@/db/schema";
import { and, asc, eq, gt, isNotNull } from "drizzle-orm";

export const serializeMap = (map: Map<unknown, unknown>): string =>
  JSON.stringify(Object.fromEntries(map));

// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
export const deserializeMap = <M extends Map<unknown, unknown>>(
  serialized: string,
): M =>
  new Map(
    Object.entries(JSON.parse(serialized) as { [key: string]: number }),
  ) as M;

export const deserializeEloMap = deserializeMap<Map<string, number>>;

export interface PlayerStatsSnapshot {
  elo: number;
  wins: number;
  losses: number;
}

export type PlayerStatsMap = Map<string, PlayerStatsSnapshot>;

export const serializePlayerStatsMap = (map: PlayerStatsMap): string =>
  JSON.stringify(Object.fromEntries(map));

export const deserializePlayerStatsMap = (serialized: string): PlayerStatsMap =>
  new Map(
    Object.entries(
      JSON.parse(serialized) as Record<string, PlayerStatsSnapshot>,
    ),
  );

export const createEmptyPlayerStatsMap = (): PlayerStatsMap => new Map();

export interface EloCalculationInput {
  player1Elo: number;
  player2Elo: number;
  player1Won: boolean;
}

export interface EloCalculationOutput {
  player1NewElo: number;
  player2NewElo: number;
}
export const calculateNewElos = ({
  player1Elo,
  player2Elo,
  player1Won,
}: EloCalculationInput): EloCalculationOutput => {
  // Player 1's win probability
  const expected1 = 1 / (1 + Math.pow(10, (player2Elo - player1Elo) / 400));

  const actual1 = player1Won ? 1 : 0;

  // ##KFactor, TODO: link to ADR
  // Currently, we use this simple formula for picking the K factor:
  // | KFactor | Player elo        |
  // |---------|-------------------|
  // | 32      | < 2100            |
  // | 24      | 2100 <= x <= 2400 |
  // | 16      | > 2400            |

  const getKFactor = (elo: number): number => {
    if (elo < 2100) return 32;
    if (elo <= 2400) return 24;
    return 16;
  };

  const player1KFactor = getKFactor(player1Elo);
  const player2KFactor = getKFactor(player2Elo);

  const player1Change = player1KFactor * (actual1 - expected1);
  const player2Change = player2KFactor * (actual1 - expected1);

  return {
    player1NewElo: Math.round(player1Elo + player1Change),
    player2NewElo: Math.round(player2Elo - player2Change),
  };
};

export async function recalculateStatsFromCheckpoint(leagueId: string, tx: Tx) {
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

  // Get league's starting ELO
  const league = await tx.query.leagues.findFirst({
    where: eq(leagues.id, leagueId),
    columns: {
      startingElo: true,
    },
  });
  if (!league) return; // League doesn't exist, nothing to update

  // If there are no matches, reset all players to default stats
  if (matchesToProcess.length === 0) {
    // Get all players in the league
    const playersInLeague = await tx.query.playersToLeagues.findMany({
      where: eq(playersToLeagues.leagueId, leagueId),
      columns: {
        playerId: true,
      },
    });

    // Reset all players' stats to default values
    const resetPromises = playersInLeague.map(({ playerId }) =>
      tx
        .update(playerStats)
        .set({
          elo: league.startingElo,
          wins: 0,
          losses: 0,
        })
        .where(
          and(
            eq(playerStats.playerId, playerId),
            eq(playerStats.leagueId, leagueId),
          ),
        ),
    );

    await Promise.all(resetPromises);
    return;
  }

  // Initialize current player stats map with checkpoint data
  const currentPlayerStatsMap = new Map(checkpointPlayerStatsMap);

  // Process each match and update complete player stats
  for (const match of matchesToProcess) {
    const player1Stats = currentPlayerStatsMap.get(match.player1Id) || {
      elo: league.startingElo,
      wins: 0,
      losses: 0,
    };
    const player2Stats = currentPlayerStatsMap.get(match.player2Id) || {
      elo: league.startingElo,
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
