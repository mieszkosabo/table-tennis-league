"use client";

import { Button, type ButtonProps } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { createLeague } from "@/lib/actions/league";
import { useAction } from "next-safe-action/hooks";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { CREATE_LEAGUE_DEFAULTS } from "@/app/features/league-management/consts";
import { CreateEditLeagueForm } from "@/components/edit-league-form";

export interface CreateLeagueButtonProps {
  buttonProps?: ButtonProps;
}

export const CreateLeagueButton = ({
  buttonProps,
}: CreateLeagueButtonProps) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const router = useRouter();

  const { execute, isPending } = useAction(createLeague, {
    onError: () => {
      toast.error("Failed to create league. Please try again.");
    },
    onSuccess: ({ data }) => {
      toast.success("League created successfully!");
      if (data) {
        router.push(`/leagues/${data.leagueId}`);
      }
    },
    onSettled: () => {
      setDialogOpen(false);
    },
  });

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" {...buttonProps}>
          Create new League
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create a new league</DialogTitle>
        </DialogHeader>

        <CreateEditLeagueForm
          onSubmit={(values) => {
            execute(values);
          }}
          isPending={isPending}
          defaults={{
            description: CREATE_LEAGUE_DEFAULTS.description,
            startingElo: CREATE_LEAGUE_DEFAULTS.startingElo,
          }}
        />
      </DialogContent>
    </Dialog>
  );
};
