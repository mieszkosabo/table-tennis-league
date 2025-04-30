"use client";

import { AddMatchButton } from "@/components/add-match-button";
import { DataTable } from "@/components/data-table";
import type { PlayersSelectorProps } from "@/components/players-selector/players-selector";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { HStack } from "@/components/ui/stack";
import type { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { removePlayerFromLeague } from "@/lib/actions/league";
import { toast } from "sonner";

export type RankingData = {
  player: {
    id: string;
    name: string;
    image?: string;
  };
  playerElo: number;
  gamesPlayed: number;
  gamesWon: number;
  gamesLost: number;
  winLossPercentage: number;
};

export const getColumns: (ctx: {
  leagueId: string;
  currentUserId: string;
  players: PlayersSelectorProps["players"];
  isLeagueOwner: boolean;
}) => ColumnDef<RankingData>[] = (ctx) => [
  {
    accessorKey: "index",
    header: () => <div className="text-right">#</div>,
    cell: ({ row }) => <div className="text-right">{row.index + 1}</div>,
  },
  {
    accessorKey: "playerName",
    enableSorting: true,
    header: "Player Name",
    cell: ({ row }) => (
      <HStack align="center" className="gap-2">
        <Avatar className="h-6 w-6">
          <AvatarImage src={row.original.player.image} />
          <AvatarFallback>
            {row.original.player.name.at(0) ?? "U"}
          </AvatarFallback>
        </Avatar>
        {row.original.player.name}
      </HStack>
    ),
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
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      return (
        <AlertDialog>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem asChild>
                <AddMatchButton
                  buttonProps={{
                    disabled: ctx.currentUserId === row.original.player.id,
                    className: "w-full p-2 font-normal justify-start",
                    variant: "ghost",
                    children: "Schedule a match",
                  }}
                  leagueId={ctx.leagueId}
                  userId={ctx.currentUserId}
                  players={ctx.players}
                  forFuture={{
                    opponentId: row.original.player.id,
                  }}
                />
              </DropdownMenuItem>
              {ctx.isLeagueOwner && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <AlertDialogTrigger>
                      Remove player from league
                    </AlertDialogTrigger>
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                Do you want to remove {row.original.player.name}?
              </AlertDialogTitle>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction asChild>
                <Button
                  variant="destructive"
                  onClick={async () => {
                    const result = await removePlayerFromLeague({
                      playerId: row.original.player.id,
                      leagueId: ctx.leagueId,
                    });
                    if (result?.serverError) {
                      toast.error(result.serverError);
                    }
                  }}
                >
                  Remove
                </Button>
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      );
    },
  },
];

// We can't import `getColumns` directly to a server
// component (ranking-table) since it's a client function. Importing
// client components into server components is fine though.
export const RankingTableWithColumns = ({
  leagueId,
  currentUserId,
  players,
  isLeagueOwner,
  data,
}: {
  leagueId: string;
  currentUserId: string;
  players: PlayersSelectorProps["players"];
  isLeagueOwner: boolean;
  data: RankingData[];
}) => {
  const columns = getColumns({
    leagueId,
    currentUserId,
    players,
    isLeagueOwner: isLeagueOwner,
  });

  return <DataTable columns={columns} data={data} />;
};
