import {
  CREATE_LEAGUE_DEFAULTS,
  CREATE_LEAGUE_LIMITS,
} from "@/app/features/league-management/consts";
import { z } from "zod";

export const createLeagueSchema = z.object({
  name: z.string().min(2).max(CREATE_LEAGUE_LIMITS.MAX_LEAGUE_NAME_LENGTH),
  description: z
    .string()
    .max(CREATE_LEAGUE_LIMITS.MAX_LEAGUE_DESCRIPTION_LENGTH)
    .optional()
    .default(CREATE_LEAGUE_DEFAULTS.description),
  startingElo: z.coerce
    .number()
    .int()
    .min(CREATE_LEAGUE_LIMITS.MIN_LEAGUE_STARTING_ELO)
    .max(CREATE_LEAGUE_LIMITS.MAX_LEAGUE_STARTING_ELO)
    .optional()
    .default(CREATE_LEAGUE_DEFAULTS.startingElo),
});

export const editLeagueSchema = createLeagueSchema.extend({
  leagueId: z.string().uuid(),
});

export const joinLeagueSchema = z.object({
  joinCode: z.string().min(1).max(255),
});
