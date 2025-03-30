"use client";

import { Check, ChevronsUpDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";

export interface LeagueSelectorProps {
  leagues: {
    id: string;
    name: string;
  }[];
}

export const LeagueSelector = ({ leagues }: LeagueSelectorProps) => {
  const router = useRouter();
  const { leagueId } = useParams();
  const [open, setOpen] = useState(false);
  const [selectedLeagueId, setSelectedLeagueId] = useState<string | null>(
    Array.isArray(leagueId) ? leagueId[0] : leagueId ?? null
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[200px] justify-between"
        >
          {selectedLeagueId
            ? leagues.find((league) => league.id === selectedLeagueId)?.name
            : "Select league..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Search your leagues..." />
          <CommandList>
            <CommandEmpty>No league found.</CommandEmpty>
            <CommandGroup>
              {leagues.map((league) => (
                <CommandItem
                  key={league.id}
                  value={league.id}
                  onSelect={(leagueId) => {
                    setSelectedLeagueId(leagueId);
                    setOpen(false);
                    router.push(`/leagues/${leagueId}`);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      selectedLeagueId === league.id
                        ? "opacity-100"
                        : "opacity-0"
                    )}
                  />
                  {league.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
          {/* TODO: Add a button to create a new league or join an existing league. */}
        </Command>
      </PopoverContent>
    </Popover>
  );
};
