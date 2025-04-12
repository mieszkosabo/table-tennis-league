"use server";

import { db } from "@/db/db";
import { leagues, playerStats, playersToLeagues } from "@/db/schema";
import { generateJoinCode } from "@/lib/utils";

import {
  createLeagueSchema,
  editLeagueSchema,
} from "@/app/features/create-league/schema";
import { authActionClient } from "@/lib/actions/safe-action";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

export const createLeague = authActionClient
  .schema(createLeagueSchema)
  .action(
    async ({
      parsedInput: { leagueName, description, startingElo },
      ctx: { user },
    }) => {
      const leagueId = await db.transaction(async (tx) => {
        const result = await tx
          .insert(leagues)
          .values({
            name: leagueName,
            description,
            startingElo,
            ownerId: user.id,
            joinCode: generateJoinCode(),
            createdAt: new Date(),
            updatedAt: new Date(),
          })
          .returning({
            id: leagues.id,
            startingElo: leagues.startingElo,
          });

        const leagueId = result[0].id;

        await Promise.all([
          tx.insert(playersToLeagues).values({
            playerId: user.id,
            leagueId,
          }),

          tx.insert(playerStats).values({
            playerId: user.id,
            leagueId,
            elo: result[0].startingElo,
          }),
        ]);

        return leagueId;
      });

      revalidatePath(`/leagues/${leagueId}`);
      return { leagueId };
    },
  );

export const editLeague = authActionClient
  .schema(editLeagueSchema)
  .action(
    async ({
      parsedInput: { leagueId, leagueName, description, startingElo },
      ctx: { user },
    }) => {
      await db.transaction(async (tx) => {
        const league = await tx.query.leagues.findFirst({
          where: and(eq(leagues.id, leagueId), eq(leagues.ownerId, user.id)),
        });

        if (!league) {
          throw new Error("League not found or you are not the owner");
        }

        await tx
          .update(leagues)
          .set({
            name: leagueName,
            description,
            startingElo,
            updatedAt: new Date(),
          })
          .where(eq(leagues.id, leagueId));

        return leagueId;
      });

      revalidatePath(`/leagues/${leagueId}`);
      return { leagueId };
    },
  );

const joinLeagueSchema = z.object({
  joinCode: z.string().min(1).max(255),
});

export const joinLeague = authActionClient
  .schema(joinLeagueSchema)
  .action(async ({ parsedInput: { joinCode }, ctx: { user } }) => {
    const leagueId = await db.transaction(async (tx) => {
      const league = await tx.query.leagues.findFirst({
        where: eq(leagues.joinCode, joinCode),
        columns: {
          id: true,
          startingElo: true,
        },
      });

      if (!league) {
        throw new Error("Invalid join code");
      }

      await Promise.all([
        tx.insert(playersToLeagues).values({
          playerId: user.id,
          leagueId: league.id,
        }),

        tx.insert(playerStats).values({
          playerId: user.id,
          leagueId: league.id,
          elo: league.startingElo,
        }),
      ]);

      return league.id;
    });

    return { leagueId };
  });
