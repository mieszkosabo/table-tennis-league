import { addMatchSchema } from "@/app/features/matches/schemas";
import {
  calculateNewElos,
  createEmptyPlayerStatsMap,
  deserializePlayerStatsMap,
  recalculateStatsFromCheckpoint,
  serializePlayerStatsMap,
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
import { and, asc, desc, eq, gt, isNotNull, lt, or } from "drizzle-orm";

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

    // Check if match date is within grace period
    const gracePeriodEnd = subDays(new Date(), env.MATCH_EDITING_GRACE_PERIOD);
    if (!isAfter(date, gracePeriodEnd)) {
      return commandError(
        `Match date must be within ${env.MATCH_EDITING_GRACE_PERIOD.toString()} days from today`,
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

    // Get the league's starting ELO for fallback
    const league = await tx.query.leagues.findFirst({
      where: eq(leagues.id, leagueId),
      columns: {
        startingElo: true,
      },
    });

    if (!league) {
      tx.rollback();
      throw new Error("League not found");
    }

    // Find the most recent match involving these players that occurred before this match date
    const priorMatches = await tx.query.matches.findMany({
      where: and(
        eq(matches.leagueId, leagueId),
        isNotNull(matches.winner),
        // Match involving either player combination
        or(
          and(
            eq(matches.player1Id, player1Id),
            eq(matches.player2Id, player2Id),
          ),
          and(
            eq(matches.player1Id, player2Id),
            eq(matches.player2Id, player1Id),
          ),
        ),
        // Before the current match date
        lt(matches.date, matchDate),
      ),
      orderBy: desc(matches.date),
      limit: 1,
      columns: {
        player1Id: true,
        player2Id: true,
        player1Elo: true,
        player2Elo: true,
      },
    });

    let player1OldElo: number;
    let player2OldElo: number;

    if (priorMatches.length > 0) {
      const priorMatch = priorMatches[0];
      // Check if players are in same order or swapped
      if (priorMatch.player1Id === player1Id) {
        player1OldElo = priorMatch.player1Elo;
        player2OldElo = priorMatch.player2Elo;
      } else {
        // Players are swapped in the prior match
        player1OldElo = priorMatch.player2Elo;
        player2OldElo = priorMatch.player1Elo;
      }
    } else {
      // No prior matches found, use league starting ELO
      player1OldElo = league.startingElo;
      player2OldElo = league.startingElo;
    }

    // Insert the match record
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

    // Recalculate all stats from checkpoint to ensure correct chronological order
    await recalculateStatsFromCheckpoint(leagueId, tx);
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

    const checkpointPlayerStatsMap = checkpoint?.playerStatsMap
      ? deserializePlayerStatsMap(checkpoint.playerStatsMap)
      : createEmptyPlayerStatsMap();

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
      const match = matchesToGoThrough[i];
      const player1Id = match.player1Id;
      const player2Id = match.player2Id;
      const matchDate = match.date;
      const winner = match.winner;

      if (isWithinGracePeriod(matchDate)) {
        break;
      }

      // Get current stats for both players
      const player1Stats = checkpointPlayerStatsMap.get(player1Id) || {
        elo: match.player1Elo,
        wins: 0,
        losses: 0,
      };
      const player2Stats = checkpointPlayerStatsMap.get(player2Id) || {
        elo: match.player2Elo,
        wins: 0,
        losses: 0,
      };

      const { player1NewElo, player2NewElo } = calculateNewElos({
        player1Elo: player1Stats.elo,
        player2Elo: player2Stats.elo,
        player1Won: winner === player1Id,
      });

      // Update player stats
      checkpointPlayerStatsMap.set(player1Id, {
        elo: player1NewElo,
        wins: winner === player1Id ? player1Stats.wins + 1 : player1Stats.wins,
        losses:
          winner === player2Id ? player1Stats.losses + 1 : player1Stats.losses,
      });

      checkpointPlayerStatsMap.set(player2Id, {
        elo: player2NewElo,
        wins: winner === player2Id ? player2Stats.wins + 1 : player2Stats.wins,
        losses:
          winner === player1Id ? player2Stats.losses + 1 : player2Stats.losses,
      });

      if (isWithinGracePeriod(matchesToGoThrough[i + 1].date)) {
        const newCheckpoint: typeof leagueCheckpoints.$inferInsert = {
          leagueId: event.data.leagueId,
          createdAtMatchId: match.id,
          playerStatsMap: serializePlayerStatsMap(checkpointPlayerStatsMap),
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
