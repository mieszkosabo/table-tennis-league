"use client";

import { HStack } from "@/components/ui/stack";
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
      <HStack justify="between" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="ranking">Ranking</TabsTrigger>
          <TabsTrigger value="matches">Matches</TabsTrigger>
        </TabsList>

        {createMatchButton}
      </HStack>
      <TabsContent value="ranking">{rankingContent}</TabsContent>
      <TabsContent value="matches">{matchesContent}</TabsContent>
    </Tabs>
  );
};
