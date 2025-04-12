"use client";

import { Button } from "@/components/ui/button";
import { HStack } from "@/components/ui/stack";
import type { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";

export type RankingData = {
  playerName: string;
  playerElo: number;
  gamesPlayed: number;
  gamesWon: number;
  gamesLost: number;
  winLossPercentage: number;
};

export const columns: ColumnDef<RankingData>[] = [
  {
    accessorKey: "index",
    header: () => <div className="text-right">#</div>,
    cell: ({ row }) => <div className="text-right">{row.index + 1}</div>,
  },
  {
    accessorKey: "playerName",
    enableSorting: true,
    header: "Player Name",
  },
  {
    accessorKey: "playerElo",
    sortDescFirst: true,
    header: ({ column }) => {
      return (
        <HStack justify="end">
          <Button
            variant="ghost"
            onClick={() => {
              column.toggleSorting(column.getIsSorted() === "asc");
            }}
          >
            <ArrowUpDown className="ml-2 h-4 w-4" />
            Elo Rating
          </Button>
        </HStack>
      );
    },
    cell: ({ row }) => (
      <div className="text-right font-medium pr-4">
        {row.original.playerElo}
      </div>
    ),
  },
  {
    accessorKey: "gamesPlayed",
    header: () => <div className="text-right">Games Played</div>,
    cell: ({ row }) => (
      <div className="text-right">{row.original.gamesPlayed}</div>
    ),
  },
  {
    accessorKey: "gamesWon",
    header: () => <div className="text-right">Games Won</div>,
    cell: ({ row }) => (
      <div className="text-right">{row.original.gamesWon}</div>
    ),
  },
  {
    accessorKey: "gamesLost",
    header: () => <div className="text-right">Games Lost</div>,
    cell: ({ row }) => (
      <div className="text-right">{row.original.gamesLost}</div>
    ),
  },
  {
    accessorKey: "winLossPercentage",
    header: () => <div className="text-right">Win/Loss Ratio</div>,
    cell: ({ row }) => (
      <div className="text-right">
        {row.original.winLossPercentage.toFixed(2)}%
      </div>
    ),
  },
];
