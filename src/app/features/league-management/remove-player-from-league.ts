import { removePlayerFromLeagueSchema } from "@/app/features/league-management/schemas";
import { leagues, matches, playerStats, playersToLeagues } from "@/db/schema";
import {
  commandError,
  commandSuccess,
  defineCommand,
  defineModelUpdateFunction,
} from "@/lib/event-sourcing/lib";
import { uuid } from "@/lib/utils";
import { and, count, eq, or } from "drizzle-orm";

export const removePlayerFromLeagueCommand = defineCommand(
  "removePlayerFromLeague",
  {
    inputSchema: removePlayerFromLeagueSchema,
    runCommand: async (input, ctx) => {
      const { tx, actorId } = ctx;

      const { leagueId, playerId } = input;

      const [leagueData, playerLeagueMatchesCount, isPlayerInLeague] =
        await Promise.all([
          tx.query.leagues.findFirst({
            where: eq(leagues.id, leagueId),
            columns: {
              ownerId: true,
            },
          }),
          tx
            .select({ count: count() })
            .from(matches)
            .where(
              and(
                eq(matches.leagueId, leagueId),
                or(
                  eq(matches.player1Id, playerId),
                  eq(matches.player2Id, playerId),
                ),
              ),
            )
            .then((result) => result[0]?.count ?? 0),
          tx.query.playersToLeagues
            .findFirst({
              where: and(
                eq(playersToLeagues.leagueId, leagueId),
                eq(playersToLeagues.playerId, playerId),
              ),
            })
            .then((result) => !!result),
        ]);

      if (!leagueData) {
        return commandError(`League not found: ${leagueId}`);
      }

      if (leagueData.ownerId !== actorId && playerId !== actorId) {
        return commandError(
          "Only league owner can remove other players from the league",
        );
      }

      if (leagueData.ownerId === playerId) {
        return commandError(
          "League owner cannot be removed from the league. Please transfer ownership first.",
        );
      }

      if (playerLeagueMatchesCount > 0) {
        return commandError(
          `Cannot remove player from league that has played some matches: ${leagueId}. Please delete all their matches first.`,
        );
      }

      if (!isPlayerInLeague) {
        return commandError(`Player ${playerId} is not in league ${leagueId}.`);
      }

      return commandSuccess([
        {
          type: "PlayerRemovedFromLeague",
          eventId: uuid(),
          actorId,
          aggregateId: leagueId,
          aggregateType: "league",
          createdAt: new Date(),
          data: {
            removedPlayerId: playerId,
          },
        },
      ]);
    },
  },
);

defineModelUpdateFunction({
  triggeringEvent: "PlayerRemovedFromLeague",
  updateFn: async (event, ctx) => {
    const { tx } = ctx;
    const { aggregateId: leagueId } = event;
    const { removedPlayerId } = event.data;

    await Promise.all([
      tx
        .delete(playersToLeagues)
        .where(
          and(
            eq(playersToLeagues.leagueId, leagueId),
            eq(playersToLeagues.playerId, removedPlayerId),
          ),
        ),

      tx
        .delete(playerStats)
        .where(
          and(
            eq(playerStats.leagueId, leagueId),
            eq(playerStats.playerId, removedPlayerId),
          ),
        ),
    ]);
  },
});
