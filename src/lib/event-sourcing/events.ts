import type { ActorId } from "@/lib/event-sourcing/lib";

export type Event =
  // League events
  | BaseEvent<{
      type: "LeagueCreated";
      data: {
        leagueName: string;
        description: string;
        startingElo: number;
      };
    }>
  | BaseEvent<{ type: "LeagueDeleted"; data: null }>
  | BaseEvent<{
      type: "LeaguePropertiesUpdated";
      data: {
        leagueName?: string;
        description?: string;
        startingElo?: number;
      };
    }>
  | BaseEvent<{ type: "LeagueJoined"; data: null }>
  | BaseEvent<{
      type: "PlayerRemovedFromLeague";
      data: {
        removedPlayerId: string;
      };
    }>
  | BaseEvent<{
      type: "LeagueOwnershipTransferred";
      data: {
        newOwnerId: string;
      };
    }>

  // Match events
  | BaseEvent<{
      type: "MatchRecorded";
      data: {
        player1Id: string;
        player2Id: string;
        winnerId: string;
        description?: string;
        matchDate: Date;
      };
    }>
  | BaseEvent<{
      type: "MatchScheduled";
      data: {
        player1Id: string;
        player2Id: string;
        matchDate: Date;
        description?: string;
      };
    }>
  | BaseEvent<{
      type: "MatchEdited";
      data: {
        player1Id: string;
        player2Id: string;
        winnerId: string;
        description?: string;
        matchDate: Date;
      };
    }>
  | BaseEvent<{ type: "MatchDeleted"; data: null }>
  | BaseEvent<{ type: "MatchWinnerSet"; data: { winnerId: string } }>

  // Player events
  | BaseEvent<{
      type: "PlayerDisplayNameUpdated";
      data: { displayName: string; leagueId: string };
    }>

  // User events
  | BaseEvent<{
      type: "UserDefaultDisplayNameUpdated";
      data: {
        displayName: string;
      };
    }>;

type BaseEvent<T extends { type: string; data: unknown }> = {
  /**
   * The unique identifier for the event.
   */
  eventId: string;
  type: T["type"];
  /**
   * Non-serialized data associated with the event.
   */
  data: T["data"];

  /**
   * The unique identifier for the actor that triggered the event.
   * This could be a user ID, or system.
   */
  actorId: ActorId;

  aggregateId: string;

  aggregateType: "league" | "match" | "player" | "user";

  createdAt: Date;
};
