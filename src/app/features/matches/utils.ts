export const serializeMap = (map: Map<unknown, unknown>): string =>
  JSON.stringify(Object.fromEntries(map));

// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
export const deserializeMap = <M extends Map<unknown, unknown>>(
  serialized: string,
): M =>
  new Map(
    Object.entries(JSON.parse(serialized) as { [key: string]: number }),
  ) as M;

export const deserializeEloMap = deserializeMap<Map<string, number>>;

export interface PlayerStatsSnapshot {
  elo: number;
  wins: number;
  losses: number;
}

export type PlayerStatsMap = Map<string, PlayerStatsSnapshot>;

export const serializePlayerStatsMap = (map: PlayerStatsMap): string =>
  JSON.stringify(Object.fromEntries(map));

export const deserializePlayerStatsMap = (serialized: string): PlayerStatsMap =>
  new Map(
    Object.entries(JSON.parse(serialized) as Record<string, PlayerStatsSnapshot>)
  );

export const createEmptyPlayerStatsMap = (): PlayerStatsMap => new Map();

export interface EloCalculationInput {
  player1Elo: number;
  player2Elo: number;
  player1Won: boolean;
}

export interface EloCalculationOutput {
  player1NewElo: number;
  player2NewElo: number;
}
export const calculateNewElos = ({
  player1Elo,
  player2Elo,
  player1Won,
}: EloCalculationInput): EloCalculationOutput => {
  // Player 1's win probability
  const expected1 = 1 / (1 + Math.pow(10, (player2Elo - player1Elo) / 400));

  const actual1 = player1Won ? 1 : 0;

  // ##KFactor, TODO: link to ADR
  // Currently, we use this simple formula for picking the K factor:
  // | KFactor | Player elo        |
  // |---------|-------------------|
  // | 32      | < 2100            |
  // | 24      | 2100 <= x <= 2400 |
  // | 16      | > 2400            |

  const getKFactor = (elo: number): number => {
    if (elo < 2100) return 32;
    if (elo <= 2400) return 24;
    return 16;
  };

  const player1KFactor = getKFactor(player1Elo);
  const player2KFactor = getKFactor(player2Elo);

  const player1Change = player1KFactor * (actual1 - expected1);
  const player2Change = player2KFactor * (actual1 - expected1);

  return {
    player1NewElo: Math.round(player1Elo + player1Change),
    player2NewElo: Math.round(player2Elo - player2Change),
  };
};
