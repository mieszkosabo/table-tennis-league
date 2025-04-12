"use server";

import { addMatchSchema } from "@/app/features/matches/add-match/schema";
import { calculateNewElos } from "@/app/features/matches/utils";
import { db } from "@/db/db";
import { matches, playerStats } from "@/db/schema";
import { authActionClient } from "@/lib/actions/safe-action";
import { and, eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export const addMatch = authActionClient
  .schema(addMatchSchema)
  .action(async ({ parsedInput, ctx: { user } }) => {
    const { leagueId, ...rest } = parsedInput;

    await db.transaction(async (tx) => {
      const [player1Elo, player2Elo] = await Promise.all([
        tx.query.playerStats.findFirst({
          where: and(
            eq(playerStats.playerId, rest.player1Id),
            eq(playerStats.leagueId, leagueId),
          ),
          columns: {
            elo: true,
          },
        }),
        tx.query.playerStats.findFirst({
          where: and(
            eq(playerStats.playerId, rest.player2Id),
            eq(playerStats.leagueId, leagueId),
          ),
          columns: {
            elo: true,
          },
        }),
      ]);

      if (!player1Elo || !player2Elo) {
        tx.rollback();
        throw new Error("Player not found");
      }
      const player1OldElo = player1Elo.elo;
      const player2OldElo = player2Elo.elo;

      await tx.insert(matches).values({
        date: rest.date,
        player1Id: rest.player1Id,
        player2Id: rest.player2Id,
        winner: rest.winner,
        score: rest.score,
        createdAt: new Date(),
        updatedAt: new Date(),
        leagueId,
        createdBy: user.id,
        player1Elo: player1OldElo,
        player2Elo: player2OldElo,
      });

      if (!rest.winner) {
        // if this is a scheduled match, we finish here
        return;
      }

      const { player1NewElo, player2NewElo } = calculateNewElos({
        player1Elo: player1OldElo,
        player2Elo: player2OldElo,
        player1Won: rest.winner === rest.player1Id,
      });

      // update elos and stats
      await Promise.all([
        tx
          .update(playerStats)
          .set({
            elo: player1NewElo,
            wins:
              player1NewElo > player1OldElo
                ? sql`${playerStats.wins} + 1`
                : sql`${playerStats.wins}`,
            losses:
              player1NewElo < player1OldElo
                ? sql`${playerStats.losses} + 1`
                : sql`${playerStats.losses}`,
          })
          .where(
            and(
              eq(playerStats.playerId, rest.player1Id),
              eq(playerStats.leagueId, leagueId),
            ),
          ),
        tx
          .update(playerStats)
          .set({
            elo: player2NewElo,
            wins:
              player2NewElo > player2OldElo
                ? sql`${playerStats.wins} + 1`
                : sql`${playerStats.wins}`,
            losses:
              player2NewElo < player2OldElo
                ? sql`${playerStats.losses} + 1`
                : sql`${playerStats.losses}`,
          })
          .where(
            and(
              eq(playerStats.playerId, rest.player2Id),
              eq(playerStats.leagueId, leagueId),
            ),
          ),
      ]);

      // TODO: update checkpoints
      // TODO: Do concurrently what can be done concurrently

      revalidatePath(`/leagues/${leagueId}/matches`);
      revalidatePath(`/leagues/${leagueId}/ranking`);
    });
  });
