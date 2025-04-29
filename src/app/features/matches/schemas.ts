import { endOfToday, isAfter, isBefore, startOfTomorrow } from "date-fns";
import { type RefinementCtx, z } from "zod";

const base = z.object({
  date: z.date(),
  player1Id: z.string().min(1),
  player2Id: z.string().min(1),
  winner: z.string().optional(),
  description: z.string().max(255).optional(),
});

const refine = (data: z.infer<typeof base>, ctx: RefinementCtx) => {
  if (data.player1Id === data.player2Id) {
    ctx.addIssue({
      code: "custom",
      message: "Players must be different",
      path: ["player2Id"],
    });
  }

  if (!data.winner && isBefore(data.date, startOfTomorrow())) {
    ctx.addIssue({
      code: "custom",
      message: "You must select a winner for past matches",
      path: ["winner"],
    });
  }

  if (data.winner && isAfter(data.date, endOfToday())) {
    ctx.addIssue({
      code: "custom",
      message: "You can't select a winner for future matches",
      path: ["winner"],
    });
  }

  if (data.winner) {
    if (data.winner !== data.player1Id && data.winner !== data.player2Id) {
      ctx.addIssue({
        code: "custom",
        message: "Winner must be one of the players",
        path: ["winner"],
      });
    }
  }
};

export const addMatchFormSchema = base.superRefine(refine);

export const addMatchSchema = base
  .extend({
    leagueId: z.string().min(1),
  })
  .superRefine(refine);

export type AddMatchSchema = z.infer<typeof addMatchSchema>;
export type AddMatchFormSchema = z.infer<typeof addMatchFormSchema>;
