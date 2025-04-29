"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { HStack } from "@/components/ui/stack";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { ColumnDef } from "@tanstack/react-table";
import { format, isFuture, isPast, isToday } from "date-fns";
import { formatDistanceToNowStrict } from "date-fns";

export type MatchesData = {
  player1: { name: string; isWinner: boolean; image?: string };
  player2: { name: string; isWinner: boolean; image?: string };
  matchDate: Date;
  player1OldElo: number;
  player2OldElo: number;
};

export const columns: ColumnDef<MatchesData>[] = [
  {
    accessorKey: "matchDate",
    header: "Match Date",
    cell: ({ row }) => {
      const isScheduledMatch =
        !row.original.player1.isWinner && !row.original.player2.isWinner;
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              {isScheduledMatch && isToday(row.original.matchDate) ? (
                <span className="text-green-700">Today</span>
              ) : (
                <span
                  className={cn(
                    isScheduledMatch &&
                      isPast(row.original.matchDate) &&
                      "text-red-700",
                  )}
                >
                  {formatDistanceToNowStrict(row.original.matchDate, {
                    addSuffix: true,
                    unit: isScheduledMatch ? "day" : undefined,
                    roundingMethod: isFuture(row.original.matchDate)
                      ? "ceil"
                      : "floor",
                  })}
                </span>
              )}
            </TooltipTrigger>
            <TooltipContent>
              <span> {format(row.original.matchDate, "PPP")}</span>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    },
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
];

const FormatPlayerName = ({
  player,
}: {
  player: MatchesData["player1" | "player2"];
}) => (
  <HStack align="center" className="gap-2">
    <Avatar
      className={cn("h-8 w-8", player.isWinner && "border-2 border-yellow-500")}
    >
      <AvatarImage src={player.image} />
      <AvatarFallback>{player.name.at(0) ?? "U"}</AvatarFallback>
    </Avatar>
    <span
      className={cn(
        "font-medium whitespace-nowrap",
        player.isWinner && "dark:text-yellow-500 text-yellow-700",
      )}
    >
      {player.isWinner ? `${player.name} 🏆` : player.name}
    </span>
  </HStack>
);
