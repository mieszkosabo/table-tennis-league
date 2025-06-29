"use server";

import { addMatchCommand } from "@/app/features/matches/add-match";
import { deleteMatchCommand } from "@/app/features/matches/delete-match";
import { editMatchCommand } from "@/app/features/matches/edit-match";
import {
  addMatchSchema,
  deleteMatchSchema,
  editMatchSchema,
  setMatchWinnerSchema,
} from "@/app/features/matches/schemas";
import { setMatchWinnerCommand } from "@/app/features/matches/set-match-winner";
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
      throw result.error;
    }

    const leagueId = result.events[0].data.leagueId;

    revalidatePath(`/leagues/${leagueId}/matches`);
    revalidatePath(`/leagues/${leagueId}/ranking`);
  });

export const editMatch = authActionClient
  .schema(editMatchSchema)
  .action(async ({ parsedInput, ctx: { user } }) => {
    const result = await db.transaction(async (tx) =>
      startProcessingEvents(
        {
          tx,
          actorId: user.id,
        },
        (ctx) => editMatchCommand(parsedInput, ctx),
      ),
    );

    if (result.type === "error") {
      throw result.error;
    }

    const leagueId = result.events[0].data.leagueId;

    revalidatePath(`/leagues/${leagueId}/matches`);
    revalidatePath(`/leagues/${leagueId}/ranking`);
  });

export const deleteMatch = authActionClient
  .schema(deleteMatchSchema)
  .action(async ({ parsedInput, ctx: { user } }) => {
    const result = await db.transaction(async (tx) =>
      startProcessingEvents(
        {
          tx,
          actorId: user.id,
        },
        (ctx) => deleteMatchCommand(parsedInput, ctx),
      ),
    );

    if (result.type === "error") {
      throw result.error;
    }

    const leagueId = parsedInput.leagueId;

    revalidatePath(`/leagues/${leagueId}/matches`);
    revalidatePath(`/leagues/${leagueId}/ranking`);
  });

export const setMatchWinner = authActionClient
  .schema(setMatchWinnerSchema)
  .action(async ({ parsedInput, ctx: { user } }) => {
    const result = await db.transaction(async (tx) =>
      startProcessingEvents(
        {
          tx,
          actorId: user.id,
        },
        (ctx) => setMatchWinnerCommand(parsedInput, ctx),
      ),
    );

    if (result.type === "error") {
      throw result.error;
    }

    const leagueId = parsedInput.leagueId;

    revalidatePath(`/leagues/${leagueId}/matches`);
    revalidatePath(`/leagues/${leagueId}/ranking`);
  });
