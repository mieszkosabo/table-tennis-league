import {
  CREATE_LEAGUE_DEFAULTS,
  CREATE_LEAGUE_LIMITS,
} from "@/app/features/create-league/consts";
import { leagues, playerStats, playersToLeagues } from "@/db/schema";
import {
  defineCommand,
  defineModelUpdateFunction,
} from "@/lib/event-sourcing/lib";
import { generateJoinCode, uuid } from "@/lib/utils";
import { z } from "zod";

const createLeagueSchema = z.object({
  name: z.string().min(2).max(CREATE_LEAGUE_LIMITS.MAX_LEAGUE_NAME_LENGTH),
  description: z
    .string()
    .max(CREATE_LEAGUE_LIMITS.MAX_LEAGUE_DESCRIPTION_LENGTH)
    .default(CREATE_LEAGUE_DEFAULTS.description),
  startingElo: z
    .number()
    .int()
    .min(CREATE_LEAGUE_LIMITS.MIN_LEAGUE_STARTING_ELO)
    .max(CREATE_LEAGUE_LIMITS.MAX_LEAGUE_STARTING_ELO)
    .default(CREATE_LEAGUE_DEFAULTS.startingElo),
});

export const createLeague = defineCommand("createLeague", {
  inputSchema: createLeagueSchema,
  runCommand: (input, ctx) => {
    // no additional validation needed

    return {
      type: "success",
      events: [
        {
          type: "LeagueCreated",
          eventId: uuid(),
          actorId: ctx.actorId,
          aggregateId: uuid(),
          aggregateType: "league",
          createdAt: new Date(),
          data: {
            leagueName: input.name,
            description: input.description,
            startingElo: input.startingElo,
          },
        },
      ],
    };
  },
});

defineModelUpdateFunction({
  triggeringEvent: "LeagueCreated",
  updateFn: async (event, ctx) => {
    const { leagueName, description, startingElo } = event.data;
    const leagueId = event.aggregateId;
    const result = await ctx.tx
      .insert(leagues)
      .values({
        id: leagueId,
        name: leagueName,
        description,
        startingElo,
        ownerId: ctx.actorId,
        joinCode: generateJoinCode(),
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning({
        startingElo: leagues.startingElo,
      });

    await Promise.all([
      ctx.tx.insert(playersToLeagues).values({
        playerId: ctx.actorId,
        leagueId,
      }),

      ctx.tx.insert(playerStats).values({
        playerId: ctx.actorId,
        leagueId,
        elo: result[0].startingElo,
      }),
    ]);
  },
});
