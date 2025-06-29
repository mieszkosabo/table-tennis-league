import { deleteMatchSchema } from "@/app/features/matches/schemas";
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

export const deleteMatchCommand = defineCommand("deleteMatch", {
  inputSchema: deleteMatchSchema,
  runCommand: async (input, ctx) => {
    const { tx, actorId } = ctx;
    const { matchId, leagueId } = input;

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
        `Match cannot be deleted. Grace period of ${gracePeriodDays.toString()} days has expired.`,
      );
    }

    // Validate league exists (basic validation)
    const leagueData = await tx.query.leagues.findFirst({
      where: eq(leagues.id, leagueId),
      columns: {
        id: true,
      },
    });

    if (!leagueData) {
      return commandError(`League not found: ${leagueId}`);
    }

    return commandSuccess([
      {
        type: "MatchDeleted",
        eventId: uuid(),
        actorId,
        aggregateId: matchId,
        aggregateType: "match",
        createdAt: new Date(),
        data: null,
      },
    ]);
  },
});

defineModelUpdateFunction({
  triggeringEvent: "MatchDeleted",
  updateFn: async (event, ctx) => {
    const { tx } = ctx;
    const { aggregateId: matchId } = event;

    // Get the match details before deletion to determine league
    const matchToDelete = await tx.query.matches.findFirst({
      where: eq(matches.id, matchId),
      columns: {
        leagueId: true,
        winner: true,
      },
    });

    if (!matchToDelete) {
      return; // Match already deleted or doesn't exist
    }

    const { leagueId, winner } = matchToDelete;

    // Delete the match from the database
    await tx.delete(matches).where(eq(matches.id, matchId));

    // If the match had a winner (was completed), recalculate ELOs
    // Scheduled matches don't affect ELO, so no recalculation needed
    if (winner) {
      await recalculateStatsFromCheckpoint(leagueId, tx);
    }
  },
});
