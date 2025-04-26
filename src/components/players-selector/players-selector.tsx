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
import { useState } from "react";

interface Player {
  id: string;
  email: string;
  name?: string | null;
  image?: string | null;
}

export interface PlayersSelectorProps {
  players: Player[];
  selectedPlayer: Player | null;
  onChange: (player: Player | null) => void;
}

export const PlayersSelector = ({
  players,
  selectedPlayer,
  onChange,
}: PlayersSelectorProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          className="w-[200px] justify-between"
        >
          {selectedPlayer
            ? (selectedPlayer.name ?? selectedPlayer.email)
            : "Select player..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Search players..." />
          <CommandList>
            <CommandEmpty>Player not found.</CommandEmpty>

            <CommandGroup>
              {players.map((player) => (
                <CommandItem
                  key={player.id}
                  value={player.name ?? player.email}
                  onSelect={() => {
                    onChange(player);
                    setIsOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      selectedPlayer?.id === player.id
                        ? "opacity-100"
                        : "opacity-0",
                    )}
                  />
                  {player.name ?? player.email}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
