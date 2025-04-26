import { editLeagueSchema } from "@/app/features/league-management/schemas";
import { leagues } from "@/db/schema";
import {
  commandError,
  commandSuccess,
  defineCommand,
  defineModelUpdateFunction,
} from "@/lib/event-sourcing/lib";
import { uuid } from "@/lib/utils";
import { eq } from "drizzle-orm";

export const editLeagueCommand = defineCommand("editLeague", {
  inputSchema: editLeagueSchema,
  runCommand: async (input, ctx) => {
    const { tx, actorId } = ctx;

    const { leagueId } = input;

    const leagueData = await tx.query.leagues.findFirst({
      where: eq(leagues.id, leagueId),
      columns: {
        ownerId: true,
      },
    });

    if (!leagueData) {
      return commandError(`League not found: ${leagueId}`);
    }

    if (leagueData.ownerId !== actorId) {
      return commandError(`You are not the owner of this league: ${leagueId}`);
    }

    return commandSuccess([
      {
        type: "LeaguePropertiesUpdated",
        eventId: uuid(),
        actorId,
        aggregateId: leagueId,
        aggregateType: "league",
        createdAt: new Date(),
        data: {
          leagueName: input.name,
          description: input.description,
          startingElo: input.startingElo,
        },
      },
    ]);
  },
});

defineModelUpdateFunction({
  triggeringEvent: "LeaguePropertiesUpdated",
  updateFn: async (event, ctx) => {
    const { leagueName, description, startingElo } = event.data;

    await ctx.tx
      .update(leagues)
      .set({
        name: leagueName,
        description,
        startingElo,
        updatedAt: new Date(),
      })
      .where(eq(leagues.id, event.aggregateId));
  },
});
