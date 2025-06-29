"use client";

import { DataTable } from "@/components/data-table/data-table";
import { EditMatchDialog } from "@/components/edit-match-dialog";
import { SetWinnerDialog } from "@/components/set-winner-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { HStack } from "@/components/ui/stack";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { env } from "@/env/client";
import { deleteMatch } from "@/lib/actions/match";
import { cn } from "@/lib/utils";
import type { ColumnDef } from "@tanstack/react-table";
import { format, isAfter, isFuture, isPast, isToday, subDays } from "date-fns";
import { formatDistanceToNowStrict } from "date-fns";
import { Edit, MoreHorizontal, Trash, Trophy } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export type MatchesData = {
  matchId: string;
  player1: { id: string; name: string; isWinner: boolean; image?: string };
  player2: { id: string; name: string; isWinner: boolean; image?: string };
  matchDate: Date;
  player1OldElo: number;
  player2OldElo: number;
  createdAt: Date;
  description?: string;
};

export const getColumns = (ctx: {
  leagueId: string;
}): ColumnDef<MatchesData>[] => [
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
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => (
      <MatchActions match={row.original} leagueId={ctx.leagueId} />
    ),
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

const MatchActions = ({
  match,
  leagueId,
}: { match: MatchesData; leagueId: string }) => {
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [setWinnerDialogOpen, setSetWinnerDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const gracePeriodEnd = subDays(
    new Date(),
    env.NEXT_PUBLIC_MATCH_EDITING_GRACE_PERIOD,
  );
  const canEdit = isAfter(match.createdAt, gracePeriodEnd);
  const isCompletedMatch = match.player1.isWinner || match.player2.isWinner;

  const handleDeleteMatch = async () => {
    const player1Name = match.player1.name;
    const player2Name = match.player2.name;
    const matchDate = format(match.matchDate, "PPP");

    const confirmed = window.confirm(
      `Are you sure you want to delete this match?\n\n${player1Name} vs ${player2Name}\n${matchDate}\n\nThis action cannot be undone.`,
    );

    if (!confirmed) return;

    setIsDeleting(true);
    try {
      await deleteMatch({
        matchId: match.matchId,
        leagueId,
      });
      toast.success("Match deleted successfully");
    } catch (error) {
      toast.error("Failed to delete match");
      console.error("Delete match error:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenuItem
                  disabled={!canEdit || !isCompletedMatch}
                  onClick={() => {
                    setEditDialogOpen(true);
                  }}
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Edit match
                </DropdownMenuItem>
              </TooltipTrigger>
              {(!canEdit || !isCompletedMatch) && (
                <TooltipContent>
                  {!isCompletedMatch
                    ? "Can't edit scheduled matches"
                    : `Can't edit matches older than ${env.NEXT_PUBLIC_MATCH_EDITING_GRACE_PERIOD.toString()} days`}
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
          
          {!isCompletedMatch && (
            <DropdownMenuItem
              onClick={() => {
                setSetWinnerDialogOpen(true);
              }}
            >
              <Trophy className="mr-2 h-4 w-4" />
              Set Winner
            </DropdownMenuItem>
          )}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenuItem
                  disabled={!canEdit || isDeleting}
                  onClick={handleDeleteMatch}
                >
                  <Trash className="mr-2 h-4 w-4" />
                  {isDeleting ? "Deleting..." : "Delete match"}
                </DropdownMenuItem>
              </TooltipTrigger>
              {!canEdit && (
                <TooltipContent>
                  {`Can't delete matches older than ${env.NEXT_PUBLIC_MATCH_EDITING_GRACE_PERIOD.toString()} days`}
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
        </DropdownMenuContent>
      </DropdownMenu>

      <EditMatchDialog
        match={match}
        leagueId={leagueId}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
      />

      <SetWinnerDialog
        match={match}
        leagueId={leagueId}
        open={setWinnerDialogOpen}
        onOpenChange={setSetWinnerDialogOpen}
      />
    </>
  );
};

// We can't import `getColumns` directly to a server
// component (matches-table) since it's a client function. Importing
// client components into server components is fine though.
export const MatchesTableWithColumns = ({
  leagueId,
  data,
  totalCount,
  className,
  paginationParam,
}: {
  leagueId: string;
  data: MatchesData[];
  totalCount: number;
  className?: string;
  paginationParam?: string;
}) => {
  const columns = getColumns({ leagueId });

  return (
    <DataTable
      columns={columns}
      data={data}
      totalRowCount={totalCount}
      className={className}
      paginationParam={paginationParam}
    />
  );
};
