"use server";

import { createLeagueCommand } from "@/app/features/league-management/create-league";
import { editLeagueCommand } from "@/app/features/league-management/edit-league";
import { joinLeagueCommand } from "@/app/features/league-management/join-league";
import { removePlayerFromLeagueCommand } from "@/app/features/league-management/remove-player-from-league";
import {
  createLeagueSchema,
  editLeagueSchema,
  joinLeagueSchema,
  removePlayerFromLeagueSchema,
} from "@/app/features/league-management/schemas";
import { db } from "@/db/db";
import { authActionClient } from "@/lib/actions/safe-action";
import { startProcessingEvents } from "@/lib/event-sourcing/lib";
import { revalidatePath } from "next/cache";

export const createLeague = authActionClient
  .schema(createLeagueSchema)
  .action(async ({ parsedInput, ctx: { user } }) => {
    const result = await db.transaction(async (tx) =>
      startProcessingEvents(
        {
          tx,
          actorId: user.id,
        },
        (ctx) => createLeagueCommand(parsedInput, ctx),
      ),
    );

    if (result.type === "error") {
      throw result.error;
    }

    const leagueId = result.events[0].aggregateId;

    revalidatePath(`/leagues/${leagueId}`);
    return { leagueId };
  });

export const editLeague = authActionClient
  .schema(editLeagueSchema)
  .action(async ({ parsedInput, ctx: { user } }) => {
    const result = await db.transaction(async (tx) =>
      startProcessingEvents(
        {
          tx,
          actorId: user.id,
        },
        (ctx) => editLeagueCommand(parsedInput, ctx),
      ),
    );

    if (result.type === "error") {
      throw result.error;
    }

    const leagueId = result.events[0].aggregateId;

    revalidatePath(`/leagues/${leagueId}`);
    return { leagueId };
  });

export const joinLeague = authActionClient
  .schema(joinLeagueSchema)
  .action(async ({ parsedInput, ctx: { user } }) => {
    const result = await db.transaction(async (tx) =>
      startProcessingEvents(
        {
          tx,
          actorId: user.id,
        },
        (ctx) => joinLeagueCommand(parsedInput, ctx),
      ),
    );

    if (result.type === "error") {
      throw result.error;
    }

    const leagueId = result.events[0].aggregateId;

    return { leagueId };
  });

export const removePlayerFromLeague = authActionClient
  .schema(removePlayerFromLeagueSchema)
  .action(async ({ parsedInput, ctx: { user } }) => {
    const result = await db.transaction(async (tx) =>
      startProcessingEvents(
        {
          tx,
          actorId: user.id,
        },
        (ctx) => removePlayerFromLeagueCommand(parsedInput, ctx),
      ),
    );

    if (result.type === "error") {
      throw result.error;
    }

    const leagueId = result.events[0].aggregateId;

    revalidatePath(`/leagues/${leagueId}`);
    return { leagueId };
  });
