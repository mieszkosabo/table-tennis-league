"use client";

import { Button } from "@/components/ui/button";
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
        <div className="flex justify-end">
          <Button
            variant="ghost"
            onClick={() => {
              column.toggleSorting(column.getIsSorted() === "asc");
            }}
          >
            Elo Rating
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        </div>
      );
    },
    cell: ({ row }) => (
      <div className="text-right font-medium">{row.original.playerElo}</div>
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
