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
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Label } from "@/components/ui/label";
import { VStack } from "@/components/ui/stack";
import { joinLeague } from "@/lib/actions/league";
import { useAction } from "next-safe-action/hooks";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export interface JoinLeagueButtonProps {
  buttonProps?: ButtonProps;
}

export const JoinLeagueButton = ({ buttonProps }: JoinLeagueButtonProps) => {
  const [joinCode, setJoinCode] = useState("");
  const [showError, setShowError] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const router = useRouter();

  const { execute, isPending } = useAction(joinLeague, {
    onError: () => {
      setJoinCode("");
      toast.error("Failed to join the league. Please try again.");
    },
    onSuccess: ({ data }) => {
      toast.success("League joined successfully!");
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
        <Button variant="default" {...buttonProps}>
          Join League
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Join a new league</DialogTitle>
        </DialogHeader>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (joinCode.length !== 8) {
              setShowError(true);
              return;
            }

            execute({ joinCode });
          }}
        >
          <div className="my-4">
            <VStack className="gap-4">
              <Label htmlFor="name">Type the join code</Label>
              <InputOTP
                maxLength={8}
                onChange={(val) => {
                  setJoinCode(val.toLocaleUpperCase());
                }}
                value={joinCode}
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                </InputOTPGroup>

                <InputOTPSeparator />

                <InputOTPGroup>
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                  <InputOTPSlot index={6} />
                  <InputOTPSlot index={7} />
                </InputOTPGroup>
              </InputOTP>
            </VStack>
          </div>

          <DialogFooter>
            <VStack className="items-end gap-2">
              <Button disabled={isPending} className="w-fit" type="submit">
                Join League
              </Button>
              {showError && (
                <p className="text-red-500 text-sm">
                  Please make sure your code is correct.
                </p>
              )}
            </VStack>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
