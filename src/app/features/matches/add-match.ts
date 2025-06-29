import { addMatchSchema } from "@/app/features/matches/schemas";
import {
  calculateNewElos,
  deserializeEloMap,
  serializeMap,
} from "@/app/features/matches/utils";
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
import { and, asc, eq, gt, isNotNull, sql } from "drizzle-orm";

export const addMatchCommand = defineCommand("addMatch", {
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
  },
});

// TODO: add description field to the define Model update

// potential checkpoint update
defineModelUpdateFunction({
  triggeringEvent: "MatchRecorded",
  updateFn: async (event, ctx) => {
    // 1. Find the league checkpoint for the league
    // if it exists:
    // check if it is "expired", i.e. it's more than GRACE_PERIOD + 2 weeks old
    // if not, then finish
    // if it is expired, then
    // 1. load all matches from the checkpoint up to the latest match
    // load the checkpoint's elo map to a variable
    // for each match, update it:
    // if the next match falls within the grace period, then
    //   update the checkpoint with the new elo map and save it to the db
    //   return;
    // else
    //  keep updating the elo map
    // if checkpoint does not exist:
    // 1. load all matches from the league
    // do the same as above

    // visualization:
    // (- is a past match, x is checkpoint, g is match that is within the grace period)

    //               checkpoint    grace period
    // ------------------x------ggggggggggggggg
    //
    // we want to move it like this:
    // ------------------------xggggggggggggggg

    const checkpoint = await ctx.tx.query.leagueCheckpoints.findFirst({
      where: eq(leagueCheckpoints.leagueId, event.data.leagueId),
    });

    const checkpointMatch = !checkpoint
      ? null
      : await ctx.tx.query.matches.findFirst({
          where: eq(matches.id, checkpoint.createdAtMatchId),
        });

    const checkpointEloMap = checkpoint?.eloMap
      ? deserializeEloMap(checkpoint.eloMap)
      : new Map<string, number>();

    const matchesToGoThrough = await ctx.tx.query.matches.findMany({
      where: and(
        // if there is a checkpoint, we want to go through all matches after it
        // otherwise, we want to go through all matches
        checkpointMatch ? gt(matches.date, checkpointMatch.date) : undefined,
        eq(matches.leagueId, event.data.leagueId),
        isNotNull(matches.winner),
      ),
      orderBy: asc(matches.date),
      columns: {
        id: true,
        player1Elo: true,
        player2Elo: true,
        player1Id: true,
        player2Id: true,
        date: true,
        winner: true,
      },
    });

    const isWithinGracePeriod = (date: Date) =>
      isAfter(date, subDays(new Date(), env.MATCH_EDITING_GRACE_PERIOD));

    for (let i = 0; i < matchesToGoThrough.length - 1; i++) {
      const player1Elo = matchesToGoThrough[i].player1Elo;
      const player2Elo = matchesToGoThrough[i].player2Elo;
      const player1Id = matchesToGoThrough[i].player1Id;
      const player2Id = matchesToGoThrough[i].player2Id;
      const matchDate = matchesToGoThrough[i].date;
      const winner = matchesToGoThrough[i].winner;

      if (isWithinGracePeriod(matchDate)) {
        break;
      }

      const { player1NewElo, player2NewElo } = calculateNewElos({
        player1Elo,
        player2Elo,
        player1Won: winner === player1Id,
      });

      checkpointEloMap.set(player1Id, player1NewElo);
      checkpointEloMap.set(player2Id, player2NewElo);

      if (isWithinGracePeriod(matchesToGoThrough[i + 1].date)) {
        const newCheckpoint: typeof leagueCheckpoints.$inferInsert = {
          leagueId: event.data.leagueId,
          createdAtMatchId: matchesToGoThrough[i].id,
          eloMap: serializeMap(checkpointEloMap),
        };

        await ctx.tx
          .insert(leagueCheckpoints)
          .values(newCheckpoint)
          .onConflictDoUpdate({
            target: leagueCheckpoints.leagueId,
            set: {
              ...newCheckpoint,
            },
          });

        break;
      }
    }
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
