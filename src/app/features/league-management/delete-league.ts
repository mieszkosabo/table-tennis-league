import { deleteLeagueSchema } from "@/app/features/league-management/schemas";
import { leagues, matches } from "@/db/schema";
import {
  commandError,
  commandSuccess,
  defineCommand,
  defineModelUpdateFunction,
} from "@/lib/event-sourcing/lib";
import { uuid } from "@/lib/utils";
import { count, eq } from "drizzle-orm";

export const deleteLeagueCommand = defineCommand("deleteLeague", {
  inputSchema: deleteLeagueSchema,
  runCommand: async (input, ctx) => {
    const { tx, actorId } = ctx;

    const { leagueId } = input;

    const [leagueData, leagueMatchesCount] = await Promise.all([
      tx.query.leagues.findFirst({
        where: eq(leagues.id, leagueId),
        columns: {
          ownerId: true,
        },
      }),
      tx
        .select({ count: count() })
        .from(matches)
        .where(eq(matches.leagueId, leagueId))
        .then((result) => result[0]?.count ?? 0),
    ]);

    if (!leagueData) {
      return commandError(`League not found: ${leagueId}`);
    }

    if (leagueData.ownerId !== actorId) {
      return commandError(`You are not the owner of this league: ${leagueId}`);
    }

    if (leagueMatchesCount > 0) {
      return commandError(
        `Cannot delete league that contains some matches: ${leagueId}. Please delete all matches first.`,
      );
    }

    return commandSuccess([
      {
        type: "LeagueDeleted",
        eventId: uuid(),
        actorId,
        aggregateId: leagueId,
        aggregateType: "league",
        createdAt: new Date(),
        data: null,
      },
    ]);
  },
});

defineModelUpdateFunction({
  triggeringEvent: "LeagueDeleted",
  updateFn: async (event, ctx) => {
    const { tx } = ctx;
    const { aggregateId: leagueId } = event;

    await tx.delete(leagues).where(eq(leagues.id, leagueId));
  },
});
