import { CREATE_LEAGUE_LIMITS } from "@/app/features/create-league/consts";
import { z } from "zod";

export const createLeagueSchema = z.object({
  leagueName: z
    .string()
    .min(2)
    .max(CREATE_LEAGUE_LIMITS.MAX_LEAGUE_NAME_LENGTH),
  description: z
    .string()
    .max(CREATE_LEAGUE_LIMITS.MAX_LEAGUE_DESCRIPTION_LENGTH)
    .optional(),
  startingElo: z.coerce
    .number()
    .min(CREATE_LEAGUE_LIMITS.MIN_LEAGUE_STARTING_ELO)
    .max(CREATE_LEAGUE_LIMITS.MAX_LEAGUE_STARTING_ELO)
    .optional(),
});

export const editLeagueSchema = createLeagueSchema.extend({
  leagueId: z.string().uuid(),
});
