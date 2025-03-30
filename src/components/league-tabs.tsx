"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
      className="w-[400px]"
    >
      <TabsList>
        <TabsTrigger value="ranking">Ranking</TabsTrigger>
        <TabsTrigger value="matches">Matches</TabsTrigger>
      </TabsList>
      <TabsContent value="ranking">{rankingContent}</TabsContent>
      <TabsContent value="matches">{matchesContent}</TabsContent>
    </Tabs>
  );
};
