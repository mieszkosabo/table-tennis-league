import { addMatchSchema } from "@/app/features/matches/schemas";
import { calculateNewElos } from "@/app/features/matches/utils";
import { leagues, matches, playerStats, playersToLeagues } from "@/db/schema";
import {
  commandError,
  commandSuccess,
  defineCommand,
  defineModelUpdateFunction,
} from "@/lib/event-sourcing/lib";
import { uuid } from "@/lib/utils";
import { and, eq, sql } from "drizzle-orm";

export const addMatchCommand = defineCommand("addCommand", {
  inputSchema: addMatchSchema,
  runCommand: async (input, ctx) => {
    const { tx, actorId } = ctx;
    const { leagueId, player1Id, player2Id, date, winner, description } = input;
    const matchId = uuid();
    // from input schema definition we can assume that
    // 1. players are different
    // 2. either winner is null and the date is in the future OR date is in the past and winner is not null
    // 3. winner is either player1Id or player2Id

    // we need to check
    // 1. if league exists
    // 2. if players are in the league

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
        `Player 2 (${player2Id})  not found in league: ${leagueId}`,
      );
    }

    if (winner) {
      return commandSuccess([
        {
          type: "MatchRecorded",
          eventId: uuid(),
          actorId,
          aggregateId: matchId,
          aggregateType: "match",
          createdAt: new Date(),
          data: {
            leagueId,
            matchDate: date,
            player1Id,
            player2Id,
            winnerId: winner,
            description,
          },
        },
      ]);
    } else {
      return commandSuccess([
        {
          type: "MatchScheduled",
          eventId: uuid(),
          actorId,
          aggregateId: matchId,
          aggregateType: "match",
          createdAt: new Date(),
          data: {
            leagueId,
            matchDate: date,
            player1Id,
            player2Id,
            description,
          },
        },
      ]);
    }
  },
});

defineModelUpdateFunction({
  triggeringEvent: "MatchRecorded",
  updateFn: async (event, ctx) => {
    const { tx, actorId } = ctx;
    const { player1Id, player2Id, winnerId, leagueId, matchDate, description } =
      event.data;

    const [player1Elo, player2Elo] = await Promise.all([
      tx.query.playerStats.findFirst({
        where: and(
          eq(playerStats.playerId, player1Id),
          eq(playerStats.leagueId, leagueId),
        ),
        columns: {
          elo: true,
        },
      }),
      tx.query.playerStats.findFirst({
        where: and(
          eq(playerStats.playerId, player2Id),
          eq(playerStats.leagueId, leagueId),
        ),
        columns: {
          elo: true,
        },
      }),
    ]);

    if (!player1Elo || !player2Elo) {
      tx.rollback();
      throw new Error("unreachable");
    }

    const player1OldElo = player1Elo.elo;
    const player2OldElo = player2Elo.elo;

    await tx.insert(matches).values({
      date: matchDate,
      player1Id: player1Id,
      player2Id: player2Id,
      winner: winnerId,
      description: description,
      createdAt: new Date(),
      updatedAt: new Date(),
      leagueId,
      createdBy: actorId,
      player1Elo: player1OldElo,
      player2Elo: player2OldElo,
    });

    const { player1NewElo, player2NewElo } = calculateNewElos({
      player1Elo: player1OldElo,
      player2Elo: player2OldElo,
      player1Won: winnerId === player1Id,
    });

    // update elos and stats
    await Promise.all([
      tx
        .update(playerStats)
        .set({
          elo: player1NewElo,
          wins:
            player1NewElo > player1OldElo
              ? sql`${playerStats.wins} + 1`
              : sql`${playerStats.wins}`,
          losses:
            player1NewElo < player1OldElo
              ? sql`${playerStats.losses} + 1`
              : sql`${playerStats.losses}`,
        })
        .where(
          and(
            eq(playerStats.playerId, player1Id),
            eq(playerStats.leagueId, leagueId),
          ),
        ),
      tx
        .update(playerStats)
        .set({
          elo: player2NewElo,
          wins:
            player2NewElo > player2OldElo
              ? sql`${playerStats.wins} + 1`
              : sql`${playerStats.wins}`,
          losses:
            player2NewElo < player2OldElo
              ? sql`${playerStats.losses} + 1`
              : sql`${playerStats.losses}`,
        })
        .where(
          and(
            eq(playerStats.playerId, player2Id),
            eq(playerStats.leagueId, leagueId),
          ),
        ),
    ]);

    // TODO: update checkpoints
  },
});

defineModelUpdateFunction({
  triggeringEvent: "MatchScheduled",
  updateFn: async (event, ctx) => {
    const { tx, actorId } = ctx;
    const { player1Id, player2Id, leagueId, matchDate, description } =
      event.data;

    const [player1Elo, player2Elo] = await Promise.all([
      tx.query.playerStats.findFirst({
        where: and(
          eq(playerStats.playerId, player1Id),
          eq(playerStats.leagueId, leagueId),
        ),
        columns: {
          elo: true,
        },
      }),
      tx.query.playerStats.findFirst({
        where: and(
          eq(playerStats.playerId, player2Id),
          eq(playerStats.leagueId, leagueId),
        ),
        columns: {
          elo: true,
        },
      }),
    ]);

    if (!player1Elo || !player2Elo) {
      tx.rollback();
      throw new Error("unreachable");
    }

    const player1OldElo = player1Elo.elo;
    const player2OldElo = player2Elo.elo;

    await tx.insert(matches).values({
      date: matchDate,
      player1Id: player1Id,
      player2Id: player2Id,
      description: description,
      createdAt: new Date(),
      updatedAt: new Date(),
      leagueId,
      createdBy: actorId,
      player1Elo: player1OldElo,
      player2Elo: player2OldElo,
    });
  },
});
