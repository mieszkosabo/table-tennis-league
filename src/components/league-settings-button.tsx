"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  deleteLeague,
  editLeague,
  removePlayerFromLeague,
} from "@/lib/actions/league";
import { useAction } from "next-safe-action/hooks";
import { useState } from "react";
import { toast } from "sonner";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { CreateEditLeagueForm } from "@/components/edit-league-form";
import { Settings } from "lucide-react";

export interface EditLeagueButtonProps {
  leagueData: {
    id: string;
    name: string;
    description: string | null;
    startingElo: number;
  };
  isOwner: boolean;
  currentUserId: string;
}

export const LeagueSettingsButton = ({
  leagueData,
  isOwner,
  currentUserId,
}: EditLeagueButtonProps) => {
  const [dialogOpen, setDialogOpen] = useState(false);

  const { execute, isPending } = useAction(editLeague, {
    onError: () => {
      toast.error("Failed to edit league details. Please try again.");
    },
    onSuccess: () => {
      toast.success("League details edited successfully!");
    },
    onSettled: () => {
      setDialogOpen(false);
    },
  });

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon">
            <Settings />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end">
          <DropdownMenuItem
            onClick={async () => {
              const result = await removePlayerFromLeague({
                leagueId: leagueData.id,
                playerId: currentUserId,
              });
              if (result?.serverError) {
                toast.error(result.serverError);
              }
            }}
          >
            Leave this league
          </DropdownMenuItem>
          {isOwner && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <DialogTrigger>Edit league details</DialogTrigger>
              </DropdownMenuItem>

              {/* TODO: */}
              {/* <DropdownMenuItem>Transfer ownership</DropdownMenuItem> */}
              <DropdownMenuItem
                onClick={async () => {
                  const result = await deleteLeague({
                    leagueId: leagueData.id,
                  });
                  if (result?.serverError) {
                    toast.error(result.serverError);
                  }
                }}
              >
                Delete this league
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit league details</DialogTitle>
        </DialogHeader>

        <CreateEditLeagueForm
          onSubmit={(values) => {
            execute({ ...values, leagueId: leagueData.id });
          }}
          isPending={isPending}
          defaults={{
            ...leagueData,
            name: leagueData.name,
            description: leagueData.description || "",
          }}
          isEdit
        />
      </DialogContent>
    </Dialog>
  );
};
