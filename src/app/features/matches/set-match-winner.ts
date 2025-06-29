import { setMatchWinnerSchema } from "@/app/features/matches/schemas";
import { recalculateStatsFromCheckpoint } from "@/app/features/matches/utils";
import { leagues, matches } from "@/db/schema";
import { env } from "@/env/server";
import {
  commandError,
  commandSuccess,
  defineCommand,
  defineModelUpdateFunction,
} from "@/lib/event-sourcing/lib";
import { uuid } from "@/lib/utils";
import { isAfter, subDays } from "date-fns";
import { and, eq } from "drizzle-orm";

export const setMatchWinnerCommand = defineCommand("setMatchWinner", {
  inputSchema: setMatchWinnerSchema,
  runCommand: async (input, ctx) => {
    const { tx, actorId } = ctx;
    const { matchId, leagueId, date, winner } = input;

    // Check if match exists and is scheduled (no winner)
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

    if (existingMatch.winner) {
      return commandError(
        "Cannot set winner for a match that already has a winner",
      );
    }

    // Validate league exists
    const leagueData = await tx.query.leagues.findFirst({
      where: eq(leagues.id, leagueId),
      columns: { id: true },
    });

    if (!leagueData) {
      return commandError(`League not found: ${leagueId}`);
    }

    // Check if match date is within grace period
    const gracePeriodEnd = subDays(new Date(), env.MATCH_EDITING_GRACE_PERIOD);
    const isWithinGracePeriod = isAfter(date, gracePeriodEnd);

    if (isWithinGracePeriod) {
      // Convert scheduled match to completed match
      return commandSuccess([
        {
          type: "MatchWinnerSet",
          eventId: uuid(),
          actorId,
          aggregateId: matchId,
          aggregateType: "match",
          createdAt: new Date(),
          data: { winnerId: winner, date },
        },
      ]);
    } else {
      // Delete the match entirely (outside grace period)
      return commandSuccess([
        {
          type: "MatchDeleted",
          eventId: uuid(),
          actorId,
          aggregateId: matchId,
          aggregateType: "match",
          createdAt: new Date(),
          data: {
            leagueId,
            isScheduled: true,
            player1Id: existingMatch.player1Id,
            player2Id: existingMatch.player2Id,
            matchDate: existingMatch.date,
          },
        },
      ]);
    }
  },
});

defineModelUpdateFunction({
  triggeringEvent: "MatchWinnerSet",
  updateFn: async (event, ctx) => {
    const { tx } = ctx;
    const { aggregateId: matchId } = event;
    const { winnerId, date } = event.data;

    // Get the existing scheduled match
    const existingMatch = await tx.query.matches.findFirst({
      where: eq(matches.id, matchId),
      columns: {
        id: true,
        leagueId: true,
        player1Id: true,
        player2Id: true,
        date: true,
        description: true,
        player1Elo: true,
        player2Elo: true,
      },
    });

    if (!existingMatch) {
      tx.rollback();
      throw new Error("Match not found for MatchWinnerSet event");
    }

    // Update the match to set the winner
    await tx
      .update(matches)
      .set({
        winner: winnerId,
        updatedAt: new Date(),
        date: date ? date : existingMatch.date,
      })
      .where(eq(matches.id, matchId));

    // Recalculate stats from checkpoint to ensure correct chronological order
    await recalculateStatsFromCheckpoint(existingMatch.leagueId, tx);
  },
});
