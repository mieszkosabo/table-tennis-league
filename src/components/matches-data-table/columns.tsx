"use client";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { ColumnDef } from "@tanstack/react-table";
import { format, isFuture } from "date-fns";
import { formatDistanceToNowStrict } from "date-fns";

export type MatchesData = {
  player1: { name: string; isWinner: boolean };
  player2: { name: string; isWinner: boolean };
  matchDate: Date;
  player1OldElo: number;
  player2OldElo: number;
};

export const columns: ColumnDef<MatchesData>[] = [
  {
    accessorKey: "matchDate",
    header: "Match Date",
    cell: ({ row }) => (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            {formatDistanceToNowStrict(row.original.matchDate, {
              addSuffix: true,
              unit: isFuture(row.original.matchDate) ? "day" : undefined,
              roundingMethod: "ceil",
            })}
          </TooltipTrigger>
          <TooltipContent>
            <span> {format(row.original.matchDate, "PPP")}</span>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    ),
  },
  {
    accessorKey: "player1",
    header: "Player 1",
    cell: ({ row }) => <FormatPlayerName player={row.original.player1} />,
  },
  {
    accessorKey: "player2",
    header: "Player 2",
    cell: ({ row }) => <FormatPlayerName player={row.original.player2} />,
  },
  {
    accessorKey: "odds",
    header: () => <div className="text-right">Odds</div>,
    cell: () => <div className="text-right">TODO</div>,
  },
];

const FormatPlayerName = ({
  player,
}: {
  player: MatchesData["player1" | "player2"];
}) => (
  <span
    className={cn(
      "font-medium whitespace-nowrap",
      player.isWinner && "dark:text-yellow-500 text-yellow-700"
    )}
  >
    {player.isWinner ? `${player.name} 🏆` : player.name}
  </span>
);
