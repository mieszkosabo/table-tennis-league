// limits
export const CREATE_LEAGUE_LIMITS = {
  MAX_LEAGUE_NAME_LENGTH: 50,
  MAX_LEAGUE_DESCRIPTION_LENGTH: 200,
  MAX_LEAGUE_STARTING_ELO: 100_000,
  MIN_LEAGUE_STARTING_ELO: -10_000,
} as const;

export const CREATE_LEAGUE_DEFAULTS = {
  description: "",
  startingElo: 1000,
} as const;
