"use client";

import { Button, type ButtonProps } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createLeague } from "@/lib/actions/league";
import { useAction } from "next-safe-action/hooks";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export interface CreateLeagueButtonProps {
  buttonProps?: ButtonProps;
}

export const CreateLeagueButton = ({
  buttonProps,
}: CreateLeagueButtonProps) => {
  const [leagueName, setLeagueName] = useState("");
  const [showError, setShowError] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const router = useRouter();

  const { execute, isPending } = useAction(createLeague, {
    onError: () => {
      setLeagueName("");
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

        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (leagueName === "") {
              setShowError(true);
              return;
            }

            execute({ name: leagueName });
          }}
        >
          <div className="my-4">
            <div className="flex flex-col gap-4">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={leagueName}
                onChange={(e) => {
                  setLeagueName(e.target.value);
                  setShowError(false);
                }}
                className="col-span-3"
              />
            </div>
          </div>

          <DialogFooter>
            <div className="flex flex-col items-end gap-2">
              <Button disabled={isPending} className="w-fit" type="submit">
                Create League
              </Button>
              {showError && (
                <p className="text-red-500 text-sm">
                  League name is required and cannot be empty.
                </p>
              )}
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
