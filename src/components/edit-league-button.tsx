"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { editLeague } from "@/lib/actions/league";
import { useAction } from "next-safe-action/hooks";
import { useState } from "react";
import { toast } from "sonner";

import { CreateEditLeagueForm } from "@/components/edit-league-form";
import { Settings } from "lucide-react";

export interface EditLeagueButtonProps {
  leagueData: {
    id: string;
    name: string;
    description: string | null;
    startingElo: number;
  };
}

export const EditLeagueButton = ({ leagueData }: EditLeagueButtonProps) => {
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
      <DialogTrigger asChild>
        <Button variant="outline" size="icon">
          <Settings />
        </Button>
      </DialogTrigger>
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
            leagueName: leagueData.name,
            description: leagueData.description || "",
          }}
          isEdit
        />
      </DialogContent>
    </Dialog>
  );
};
