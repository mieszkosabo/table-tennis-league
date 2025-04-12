"use client";

import { Button, type ButtonProps } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { zodResolver } from "@hookform/resolvers/zod";
import { endOfToday, format } from "date-fns";
import { useAction } from "next-safe-action/hooks";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import {
  type AddMatchFormSchema,
  addMatchFormSchema,
} from "@/app/features/matches/add-match/schema";
import {
  PlayersSelector,
  type PlayersSelectorProps,
} from "@/components/players-selector/players-selector";
import { Calendar } from "@/components/ui/calendar";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { addMatch } from "@/lib/actions/match";
import { cn } from "@/lib/utils";
import { CalendarIcon, PlusIcon } from "lucide-react";

export interface CreateMatchButtonProps {
  buttonProps?: ButtonProps;
  players: PlayersSelectorProps["players"];
  leagueId: string;
}

export const CreateMatchButton = ({
  buttonProps,
  players,
  leagueId,
}: CreateMatchButtonProps) => {
  const [dialogOpen, setDialogOpen] = useState(false);

  const { isPending, execute } = useAction(addMatch, {
    onError: () => {
      toast.error("Failed to add match. Please try again.");
    },
    onSuccess: () => {
      toast.success("Match added successfully!");
    },
    onSettled: () => {
      setDialogOpen(false);
    },
  });

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button {...buttonProps}>
          <PlusIcon />
          Add match
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add match</DialogTitle>
        </DialogHeader>

        <CreateMatchForm
          onSubmit={(values) => {
            execute({ ...values, leagueId });
          }}
          isPending={isPending}
          players={players}
        />
      </DialogContent>
    </Dialog>
  );
};

function CreateMatchForm({
  onSubmit,
  isPending,
  players,
}: {
  onSubmit: (values: AddMatchFormSchema) => void;
  isPending?: boolean;
  players: PlayersSelectorProps["players"];
}) {
  const form = useForm<AddMatchFormSchema>({
    resolver: zodResolver(addMatchFormSchema),
    defaultValues: {
      // default to today
      date: endOfToday(),
    },
  });

  console.log("form", form.formState);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Date</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn("w-[240px] pl-3 text-left font-normal")}
                    >
                      {format(field.value, "PPP")}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) => date < new Date("1900-01-01")}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormDescription>
                Date on which the match took place.
                <br /> You can pick future date to schedule a match.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          disabled={isPending}
          control={form.control}
          name="player1Id"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Player 1</FormLabel>
              <FormControl>
                <PlayersSelector
                  players={players}
                  onChange={(value) => {
                    field.onChange(value?.id);
                  }}
                  selectedPlayer={
                    players.find((player) => player.id === field.value) ?? null
                  }
                />
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          disabled={isPending}
          control={form.control}
          name="player2Id"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Player 2</FormLabel>
              <FormControl>
                <PlayersSelector
                  players={players}
                  onChange={(value) => {
                    field.onChange(value?.id);
                  }}
                  selectedPlayer={
                    players.find((player) => player.id === field.value) ?? null
                  }
                />
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          disabled={isPending}
          control={form.control}
          name="winner"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>
                Winner{" "}
                <span className="dark:text-slate-400 text-slate-500">
                  (optional)
                </span>
              </FormLabel>
              <FormControl>
                <PlayersSelector
                  players={players}
                  onChange={(value) => {
                    field.onChange(value?.id);
                  }}
                  selectedPlayer={
                    players.find((player) => player.id === field.value) ?? null
                  }
                />
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end">
          <Button disabled={isPending} type="submit">
            Add match
          </Button>
        </div>
      </form>
    </Form>
  );
}
