"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";

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
    cell: ({ row }) => <span> {format(row.original.matchDate, "PPP")}</span>,
  },
  {
    accessorKey: "player1",
    header: "Player 1",
    cell: ({ row }) => (
      <div className="font-medium">
        {row.original.player1.name}
        {row.original.player1.isWinner && <span className="ml-1">🏆</span>}
      </div>
    ),
  },
  {
    accessorKey: "player2",
    header: "Player 2",
    cell: ({ row }) => (
      <div className="font-medium">
        {row.original.player2.name}
        {row.original.player2.isWinner && <span className="ml-1">🏆</span>}
      </div>
    ),
  },
  {
    accessorKey: "odds",
    header: () => <div className="text-right">Odds</div>,
    cell: () => <div className="text-right">TODO</div>,
  },
];
