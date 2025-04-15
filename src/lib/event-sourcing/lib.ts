import { type Tx, db } from "@/db/db";

type Event = {
  type: string;
};

type AppError = {
  message: string;
};

type Command = (
  tx: Tx,
  input: any,
) => Promise<
  { type: "error"; error: AppError } | { type: "success"; events: Event[] }
>;

export const startProcessingEvents = async (
  runCommand: (tx: Tx) => ReturnType<Command>,
) => {
  await db.transaction(async (tx) => {
    const maybeEvents = await runCommand(tx);
    if (maybeEvents.type === "error") {
      throw new Error(maybeEvents.error.message);
    }

    const eventsToHandle = maybeEvents.events;

    for (const event of eventsToHandle) {
    }
  });
};
