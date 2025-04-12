import { db } from "@/db/db";
import { leagues, playersToLeagues } from "@/db/schema";
import { eq } from "drizzle-orm";
import { cache } from "react";

export const getUserLeagues = cache(async (userId: string) => {
  return db.query.playersToLeagues.findMany({
    where: eq(playersToLeagues.playerId, userId),
    with: {
      league: {
        columns: {
          id: true,
          name: true,
        },
      },
    },
  });
});

export const getLeague = cache(async (leagueId: string) => {
  return db.query.leagues.findFirst({
    where: eq(leagues.id, leagueId),
    columns: {
      id: true,
      name: true,
      joinCode: true,
      ownerId: true,
      startingElo: true,
      description: true,
    },
    with: {
      playersToLeagues: {
        with: {
          player: {
            columns: {
              id: true,
              email: true,
              name: true,
              image: true,
            },
          },
        },
      },
    },
  });
});

export const assertUserInLeague = (
  userId: string,
  leagueData: Awaited<ReturnType<typeof getLeague>>,
) => {
  if (!leagueData) {
    return false;
  }

  return !!leagueData.playersToLeagues.find((p) => p.playerId === userId);
};
