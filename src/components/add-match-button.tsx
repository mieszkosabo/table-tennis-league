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
import { format, isPast, isToday } from "date-fns";
import { useAction } from "next-safe-action/hooks";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import {
  type AddMatchFormSchema,
  addMatchFormSchema,
} from "@/app/features/matches/schemas";
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
import { HStack } from "@/components/ui/stack";
import { addMatch } from "@/lib/actions/match";
import { cn } from "@/lib/utils";
import { CalendarIcon, PlusIcon } from "lucide-react";

export interface CreateMatchButtonProps {
  buttonProps?: ButtonProps;
  players: PlayersSelectorProps["players"];
  leagueId: string;
  userId: string;
  /**
   * If provided, this form will be used only to schedule a future match.
   */
  forFuture?: {
    opponentId: string;
  };
}

export const AddMatchButton = ({
  buttonProps,
  players,
  leagueId,
  userId,
  forFuture,
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
        <Button
          // we use `children` prop so that ...buttonProps can
          // override it as well.
          // eslint-disable-next-line react/no-children-prop
          children={
            <>
              <PlusIcon />
              Add match
            </>
          }
          {...buttonProps}
        />
      </DialogTrigger>
      <DialogContent
        onInteractOutside={(e) => {
          e.preventDefault();
        }}
        onEscapeKeyDown={(e) => {
          e.preventDefault();
        }}
      >
        <DialogHeader>
          <DialogTitle>Add match</DialogTitle>
        </DialogHeader>

        <AddMatchForm
          userId={userId}
          onSubmit={(values) => {
            execute({ ...values, leagueId });
          }}
          isPending={isPending}
          players={players}
          forFuture={forFuture}
        />
      </DialogContent>
    </Dialog>
  );
};

function AddMatchForm({
  onSubmit,
  isPending,
  players,
  userId,
  forFuture,
}: {
  onSubmit: (values: AddMatchFormSchema) => void;
  isPending?: boolean;
  players: PlayersSelectorProps["players"];
  userId: string;
  /**
   * If provided, this form will be used only to schedule a future match.
   */
  forFuture?: {
    opponentId: string;
  };
}) {
  const isForFuture = !!forFuture;
  const form = useForm<AddMatchFormSchema>({
    resolver: zodResolver(addMatchFormSchema),
    defaultValues: {
      date: new Date(),
      player1Id: userId,
      player2Id: forFuture?.opponentId ?? undefined,
    },
  });

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
                    weekStartsOn={1}
                    selected={field.value}
                    onSelect={(val) => {
                      // "unclicking" a date make it look like today is selected
                      // but in this handler the value is undefined, so we need to
                      // match this behavior here as well explicitly.
                      if (!val) {
                        field.onChange(new Date());
                      } else {
                        field.onChange(val);
                      }
                    }}
                    disabled={(date) =>
                      isForFuture
                        ? isPast(date) && !isToday(date)
                        : date < new Date("1900-01-01")
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              {!isForFuture && (
                <FormDescription>
                  Date on which the match took place.
                  <br /> You can pick future date to schedule a match.
                </FormDescription>
              )}
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
                  disabled={isForFuture}
                  players={players.filter(
                    (player) => player.id !== form.watch("player2Id"),
                  )}
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
                  disabled={isForFuture}
                  players={players.filter(
                    (player) => player.id !== form.watch("player1Id"),
                  )}
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

        {!isForFuture && (
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
                    players={[form.watch("player1Id"), form.watch("player2Id")]
                      .map((id) =>
                        !id ? null : players.find((player) => player.id === id),
                      )
                      .filter((player) => player != null)}
                    onChange={(value) => {
                      field.onChange(value?.id);
                    }}
                    selectedPlayer={
                      players.find((player) => player.id === field.value) ??
                      null
                    }
                  />
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <HStack justify="end">
          <Button disabled={isPending} type="submit">
            Add match
          </Button>
        </HStack>
      </form>
    </Form>
  );
}
