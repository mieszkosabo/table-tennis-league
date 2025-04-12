"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRouter } from "next/navigation";
import type React from "react";

export interface LeagueTabsProps {
  value: "ranking" | "matches";
  leagueId: string;
  rankingContent: React.ReactNode;
  matchesContent: React.ReactNode;
  createMatchButton: React.ReactNode;
}

export const LeagueTabs = ({
  value,
  leagueId,
  rankingContent,
  matchesContent,
  createMatchButton,
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

        {createMatchButton}
      </div>
      <TabsContent value="ranking">{rankingContent}</TabsContent>
      <TabsContent value="matches">{matchesContent}</TabsContent>
    </Tabs>
  );
};
