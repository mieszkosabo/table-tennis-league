import { transferLeagueOwnershipSchema } from "@/app/features/league-management/schemas";
import { leagues, playersToLeagues } from "@/db/schema";
import {
  commandError,
  commandSuccess,
  defineCommand,
  defineModelUpdateFunction,
} from "@/lib/event-sourcing/lib";
import { uuid } from "@/lib/utils";
import { and, eq } from "drizzle-orm";

export const transferLeagueOwnershipCommand = defineCommand(
  "transferLeagueOwnership",
  {
    inputSchema: transferLeagueOwnershipSchema,
    runCommand: async (input, ctx) => {
      const { tx, actorId } = ctx;

      const { leagueId, newOwnerId } = input;

      const [leagueData, isNewOwnerInLeague] = await Promise.all([
        tx.query.leagues.findFirst({
          where: eq(leagues.id, leagueId),
          columns: {
            ownerId: true,
          },
        }),
        tx.query.playersToLeagues
          .findFirst({
            where: and(
              eq(playersToLeagues.leagueId, leagueId),
              eq(playersToLeagues.playerId, newOwnerId),
            ),
          })
          .then((result) => !!result),
      ]);

      if (!leagueData) {
        return commandError(`League not found: ${leagueId}`);
      }

      if (leagueData.ownerId !== actorId) {
        return commandError("You are not the owner of this league.");
      }

      if (!isNewOwnerInLeague) {
        return commandError("New owner must be a player in the league.");
      }

      return commandSuccess([
        {
          type: "LeagueOwnershipTransferred",
          eventId: uuid(),
          actorId,
          aggregateId: leagueId,
          aggregateType: "league",
          createdAt: new Date(),
          data: {
            newOwnerId,
          },
        },
      ]);
    },
  },
);

defineModelUpdateFunction({
  triggeringEvent: "LeagueOwnershipTransferred",
  updateFn: async (event, ctx) => {
    const { tx } = ctx;
    const { aggregateId: leagueId } = event;
    const { newOwnerId } = event.data;

    await tx
      .update(leagues)
      .set({
        ownerId: newOwnerId,
      })
      .where(eq(leagues.id, leagueId));
  },
});
