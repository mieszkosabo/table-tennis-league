"use client";

import {
  type EditMatchFormSchema,
  editMatchFormSchema,
} from "@/app/features/matches/schemas";
import type { MatchesData } from "@/components/matches-data-table/columns";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { HStack, VStack } from "@/components/ui/stack";
import { editMatch } from "@/lib/actions/match";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

interface EditMatchDialogProps {
  match: MatchesData;
  leagueId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditMatchDialog({
  match,
  leagueId,
  open,
  onOpenChange,
}: EditMatchDialogProps) {
  const form = useForm<EditMatchFormSchema>({
    resolver: zodResolver(editMatchFormSchema),
    defaultValues: {
      date: match.matchDate,
      player1Id: match.player1.id,
      player2Id: match.player2.id,
      winner: match.player1.isWinner
        ? match.player1.id
        : match.player2.isWinner
          ? match.player2.id
          : undefined,
      description: match.description || "",
    },
  });

  const { execute, isPending } = useAction(editMatch, {
    onError: ({ error }) => {
      toast.error(error.serverError || "Failed to edit match");
    },
    onSuccess: () => {
      toast.success("Match updated successfully");
      onOpenChange(false);
    },
  });

  const onSubmit = (data: EditMatchFormSchema) => {
    execute({
      matchId: match.matchId,
      leagueId,
      ...data,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Match</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <VStack>
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Match Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn("pl-3 text-left font-normal")}
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
                          disabled={(date) =>
                            date > new Date() || date < new Date("1900-01-01")
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <VStack className="my-2" />

              <FormField
                control={form.control}
                name="winner"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Winner</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        value={field.value}
                        className="flex flex-col space-y-2"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem
                            value={match.player1.id}
                            id="player1"
                          />
                          <Label htmlFor="player1">{match.player1.name}</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem
                            value={match.player2.id}
                            id="player2"
                          />
                          <Label htmlFor="player2">{match.player2.name}</Label>
                        </div>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <HStack className="justify-end pt-6 gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    onOpenChange(false);
                  }}
                  disabled={isPending}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isPending}>
                  {isPending ? "Updating..." : "Update Match"}
                </Button>
              </HStack>
            </VStack>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
