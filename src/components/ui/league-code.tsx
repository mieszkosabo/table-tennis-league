"use client";

import { Button } from "@/components/ui/button";
import { CopyIcon } from "lucide-react";

export interface LeagueCodeProps {
  joinCode: string;
}

export const LeagueCode = ({ joinCode }: LeagueCodeProps) => {
  return (
    <div className="flex items-center gap-2">
      <span className="text-md text-slate-500 dark:text-slate-300 tracking-widest">
        {formatJoinCode(joinCode)}
      </span>
      <Button
        variant="ghost"
        size="icon"
        onClick={async () => {
          await navigator.clipboard.writeText(joinCode);
        }}
      >
        <CopyIcon />
      </Button>
    </div>
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
