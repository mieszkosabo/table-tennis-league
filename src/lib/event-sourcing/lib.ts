import { type Tx, db } from "@/db/db";
import type { Event } from "@/lib/event-sourcing/events";
import type { z } from "zod";

export const commandError = (
  message: string,
): { type: "error"; error: { message: string } } => ({
  type: "error",
  error: {
    message,
  },
});

export const commandSuccess = <const Events extends Event[]>(
  events: Events,
): { type: "success"; events: Events } => ({
  type: "success",
  events,
});

export type ActorId = string;

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

export const startProcessingEvents = async <const Events extends Event[]>(
  ctx: Context,
  runCommand: (
    ctx: Context,
  ) => Promise<
    { type: "success"; events: Events } | { type: "error"; error: AppError }
  >,
): Promise<
  { type: "success"; events: Events } | { type: "error"; error: AppError }
> => {
  return await db.transaction(async (tx) => {
    const maybeEvents = await runCommand(ctx);
    if (maybeEvents.type === "error") {
      return maybeEvents;
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

    return maybeEvents;
  });
};
