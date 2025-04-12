"use client";

import { Button } from "@/components/ui/button";
import { CopyIcon } from "lucide-react";

export interface InviteButtonProps {
  joinCode: string;
}

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { LinkIcon, UserPlusIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export const InviteButton = ({ joinCode }: InviteButtonProps) => {
  const [open, setOpen] = useState(false);

  const copyCode = async () => {
    await navigator.clipboard.writeText(joinCode);
    toast("Copied!");
  };

  const copyLink = async () => {
    const link = `${window.location.origin}/join?joinCode=${joinCode}`;
    await navigator.clipboard.writeText(link);
    toast("Copied!");
  };
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary" className="flex items-center gap-2">
          <UserPlusIcon className="h-4 w-4" />
          <span>Invite</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Invite others</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-4">
          <div className="flex items-center justify-between gap-2 p-3 border rounded-md">
            <span className="text-md font-mono tracking-widest">
              {formatJoinCode(joinCode)}
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={copyCode}
              aria-label="Copy join code"
            >
              <CopyIcon className="h-4 w-4" />
            </Button>
          </div>
          <Button
            variant="outline"
            onClick={copyLink}
            className="flex items-center gap-2"
          >
            <LinkIcon className="h-4 w-4" />
            <span>Copy Join Link</span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

function formatJoinCode(joinCode: string) {
  return (
    <>
      <span className="mr-1">
        {joinCode.slice(0, Math.floor(joinCode.length / 2))}
      </span>
      <span>{joinCode.slice(Math.floor(joinCode.length / 2))}</span>
    </>
  );
}
