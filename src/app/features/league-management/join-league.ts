import { joinLeagueSchema } from "@/app/features/league-management/schemas";
import { leagues, playerStats, playersToLeagues } from "@/db/schema";
import {
  commandError,
  commandSuccess,
  defineCommand,
  defineModelUpdateFunction,
} from "@/lib/event-sourcing/lib";
import { uuid } from "@/lib/utils";
import { and, eq } from "drizzle-orm";

export const joinLeagueCommand = defineCommand("joinLeague", {
  inputSchema: joinLeagueSchema,
  runCommand: async (input, ctx) => {
    const { tx, actorId } = ctx;

    const { joinCode } = input;

    const leagueData = await tx.query.leagues.findFirst({
      where: eq(leagues.joinCode, joinCode),
      columns: {
        id: true,
      },
    });

    if (!leagueData) {
      return commandError(`No league found for this code: ${joinCode}`);
    }

    const isAlreadyInLeague = !!(await tx.query.playersToLeagues.findFirst({
      where: and(
        eq(playersToLeagues.playerId, actorId),
        eq(playersToLeagues.leagueId, leagueData.id),
      ),
    }));

    if (isAlreadyInLeague) {
      return commandError(
        `User ${actorId} already joined this league: ${leagueData.id}`,
      );
    }

    return commandSuccess([
      {
        type: "LeagueJoined",
        eventId: uuid(),
        actorId,
        aggregateId: leagueData.id,
        aggregateType: "league",
        createdAt: new Date(),
        data: null,
      },
    ]);
  },
});

defineModelUpdateFunction({
  triggeringEvent: "LeagueJoined",
  updateFn: async (event, ctx) => {
    const { tx } = ctx;
    const { actorId, aggregateId } = event;

    // this is already validated in the command
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const league = (await tx.query.leagues.findFirst({
      where: eq(leagues.id, aggregateId),
      columns: {
        startingElo: true,
      },
    }))!;

    await Promise.all([
      tx.insert(playersToLeagues).values({
        playerId: actorId,
        leagueId: aggregateId,
      }),

      tx.insert(playerStats).values({
        playerId: actorId,
        leagueId: aggregateId,
        elo: league.startingElo,
      }),
    ]);
  },
});
