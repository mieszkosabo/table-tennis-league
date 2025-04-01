"use client";

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlusIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import type React from "react";

export interface LeagueTabsProps {
  value: "ranking" | "matches";
  leagueId: string;
  rankingContent: React.ReactNode;
  matchesContent: React.ReactNode;
}

export const LeagueTabs = ({
  value,
  leagueId,
  rankingContent,
  matchesContent,
}: LeagueTabsProps) => {
  const router = useRouter();

  return (
    <Tabs
      value={value}
      onValueChange={(value) => {
        router.push(`/leagues/${leagueId}/${value}`);
      }}
    >
      <div className="flex w-full justify-between">
        <TabsList className="mb-4">
          <TabsTrigger value="ranking">Ranking</TabsTrigger>
          <TabsTrigger value="matches">Matches</TabsTrigger>
        </TabsList>

        <Button>
          <PlusIcon />
          Add match
        </Button>
      </div>
      <TabsContent value="ranking">{rankingContent}</TabsContent>
      <TabsContent value="matches">{matchesContent}</TabsContent>
    </Tabs>
  );
};
