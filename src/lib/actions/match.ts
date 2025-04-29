"use server";

import { addMatchCommand } from "@/app/features/matches/add-match";
import { addMatchSchema } from "@/app/features/matches/schemas";
import { db } from "@/db/db";
import { authActionClient } from "@/lib/actions/safe-action";
import { startProcessingEvents } from "@/lib/event-sourcing/lib";
import { revalidatePath } from "next/cache";

export const addMatch = authActionClient
  .schema(addMatchSchema)
  .action(async ({ parsedInput, ctx: { user } }) => {
    const result = await db.transaction(async (tx) =>
      startProcessingEvents(
        {
          tx,
          actorId: user.id,
        },
        (ctx) => addMatchCommand(parsedInput, ctx),
      ),
    );

    if (result.type === "error") {
      throw new Error(result.error.message);
    }

    const leagueId = result.events[0].data.leagueId;

    revalidatePath(`/leagues/${leagueId}/matches`);
    revalidatePath(`/leagues/${leagueId}/ranking`);
  });
