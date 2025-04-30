import type { Tx } from "@/db/db";
import { events } from "@/db/schema";
import type { Event } from "@/lib/event-sourcing/events";
import type { z } from "zod";

export const commandError = (
  message: string,
): { type: "error"; error: AppError } => ({
  type: "error",
  error: new AppError(message),
});

export const commandSuccess = <const Events extends Event[]>(
  events: Events,
): { type: "success"; events: Events } => ({
  type: "success",
  events,
});

export type ActorId = string;

export class AppError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AppError";
  }
}

type MaybePromise<T> = T | Promise<T>;

type Context = {
  tx: Tx;
  actorId: ActorId;
};

export const defineCommand =
  <
    Schema extends z.ZodTypeAny,
    const RunCommandResult extends
      | { type: "error"; error: AppError }
      | { type: "success"; events: Event[] },
  >(
    name: string,
    args: {
      inputSchema: Schema;
      runCommand: (
        input: z.infer<Schema>,
        ctx: Context,
      ) => MaybePromise<RunCommandResult>;
    },
  ) =>
  async (input: z.infer<Schema>, ctx: Context) => {
    const parsedInput = args.inputSchema.safeParse(input);
    if (!parsedInput.success) {
      return commandError(
        `Invalid input for command ${name}: ${parsedInput.error.message}`,
      );
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

export const startProcessingEvents = async <
  const RunCommandResult extends
    | { type: "error"; error: AppError }
    | { type: "success"; events: Event[] },
>(
  ctx: Context,
  runCommand: (ctx: Context) => Promise<RunCommandResult>,
) => {
  const { tx } = ctx;
  const maybeEvents = await runCommand(ctx);
  if (maybeEvents.type === "error") {
    return maybeEvents;
  }

  const eventsToHandle = maybeEvents.events;

  for (const event of eventsToHandle) {
    await tx.insert(events).values({
      id: event.eventId,
      type: event.type,
      actorId: event.actorId,
      aggregateId: event.aggregateId,
      aggregateType: event.aggregateType,
      createdAt: event.createdAt,
      data: event.data,
    });
    const updateFns = ModelUpdateFunctionRegistry.get(event.type);
    if (updateFns) {
      for (const updateFn of updateFns) {
        await updateFn(event, { tx, actorId: ctx.actorId });
      }
    }
  }

  return maybeEvents;
};
