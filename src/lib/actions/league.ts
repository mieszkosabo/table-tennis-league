"use server";

import { db } from "@/db/db";
import { leagues, playersToLeagues } from "@/db/schema";
import { generateJoinCode } from "@/lib/utils";

import { authActionClient } from "@/lib/actions/safe-action";
import { eq } from "drizzle-orm";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(1).max(255),
});

export const createLeague = authActionClient
  .schema(schema)
  .action(async ({ parsedInput: { name }, ctx: { user } }) => {
    const leagueId = await db.transaction(async (tx) => {
      const result = await tx
        .insert(leagues)
        .values({
          name,
          ownerId: user.id,
          joinCode: generateJoinCode(),
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning({
          id: leagues.id,
        });

      const leagueId = result[0].id;

      await tx.insert(playersToLeagues).values({
        playerId: user.id,
        leagueId,
      });

      return leagueId;
    });

    return { leagueId };
  });

const joinLeagueSchema = z.object({
  joinCode: z.string().min(1).max(255),
});

export const joinLeague = authActionClient
  .schema(joinLeagueSchema)
  .action(async ({ parsedInput: { joinCode }, ctx: { user } }) => {
    const leagueId = await db.transaction(async (tx) => {
      const league = await tx.query.leagues.findFirst({
        where: eq(leagues.joinCode, joinCode),
      });

      if (!league) {
        throw new Error("Invalid join code");
      }

      await tx.insert(playersToLeagues).values({
        playerId: user.id,
        leagueId: league.id,
      });

      return league.id;
    });

    return { leagueId };
  });
