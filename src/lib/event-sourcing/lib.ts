import { type Tx, db } from "@/db/db";
import type { z } from "zod";

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
        startingElo?: string;
      };
    }>
  | BaseEvent<{ type: "LeagueJoined"; data: null }>
  | {
      type: "PlayerRemovedFromLeague";
      data: {
        removedPlayerId: string;
      };
    }
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

type ActorId = string;

type AppError = {
  message: string;
};

type MaybePromise<T> = T | Promise<T>;

type Context = {
  tx: Tx;
  actorId: ActorId;
};

export const defineCommand =
  <Schema extends z.ZodTypeAny, const Events extends Event[]>(
    name: string,
    args: {
      inputSchema: Schema;
      runCommand: (
        input: z.infer<Schema>,
        ctx: Context,
      ) => MaybePromise<
        { type: "error"; error: AppError } | { type: "success"; events: Events }
      >;
    },
  ) =>
  async (
    input: z.infer<Schema>,
    ctx: Context,
  ): Promise<
    { type: "error"; error: AppError } | { type: "success"; events: Events }
  > => {
    const parsedInput = args.inputSchema.safeParse(input);
    if (!parsedInput.success) {
      return {
        type: "error",
        error: {
          message: `Invalid input for command ${name}: ${parsedInput.error.message}`,
        },
      };
    }

    return args.runCommand(parsedInput.data as z.infer<Schema>, ctx);
  };

type UpdateFn = (event: Event, ctx: Context) => Promise<void>;

const ModelUpdateFunctionRegistry = new Map<string, UpdateFn[]>();

export const defineModelUpdateFunction = <
  EventType extends Event["type"],
>(args: {
  triggeringEvent: EventType;
  updateFn: (
    event: Extract<Event, { type: EventType }>,
    ctx: Context,
  ) => Promise<void>;
}) => {
  const { triggeringEvent, updateFn } = args;

  if (!ModelUpdateFunctionRegistry.has(triggeringEvent)) {
    ModelUpdateFunctionRegistry.set(triggeringEvent, []);
  }

  ModelUpdateFunctionRegistry.get(triggeringEvent)?.push(updateFn as UpdateFn);
  return updateFn;
};

export const startProcessingEvents = async (
  ctx: Context,
  runCommand: (
    ctx: Context,
  ) => Promise<
    { type: "success"; events: Event[] } | { type: "error"; error: AppError }
  >,
): Promise<AppError | null> => {
  return await db.transaction(async (tx) => {
    const maybeEvents = await runCommand(ctx);
    if (maybeEvents.type === "error") {
      return maybeEvents.error;
    }

    const eventsToHandle = maybeEvents.events;

    for (const event of eventsToHandle) {
      const updateFns = ModelUpdateFunctionRegistry.get(event.type);
      if (updateFns) {
        for (const updateFn of updateFns) {
          await updateFn(event, { tx, actorId: ctx.actorId });
        }
      }
    }

    return null;
  });
};
