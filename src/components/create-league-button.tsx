"use client";

import { Button, type ButtonProps } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { createLeague } from "@/lib/actions/league";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAction } from "next-safe-action/hooks";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod";

import {
  CREATE_LEAGUE_DEFAULTS,
  CREATE_LEAGUE_LIMITS,
} from "@/app/features/create-league/consts";
import { createLeagueSchema } from "@/app/features/create-league/schema";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { HStack } from "@/components/ui/stack";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

export interface CreateLeagueButtonProps {
  buttonProps?: ButtonProps;
}

export const CreateLeagueButton = ({
  buttonProps,
}: CreateLeagueButtonProps) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const router = useRouter();

  const { execute, isPending } = useAction(createLeague, {
    onError: () => {
      toast.error("Failed to create league. Please try again.");
    },
    onSuccess: ({ data }) => {
      toast.success("League created successfully!");
      if (data) {
        router.push(`/leagues/${data.leagueId}`);
      }
    },
    onSettled: () => {
      setDialogOpen(false);
    },
  });

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" {...buttonProps}>
          Create new League
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create a new league</DialogTitle>
        </DialogHeader>

        <CreateLeagueForm
          onSubmit={(values) => {
            execute(values);
          }}
          isPending={isPending}
        />
      </DialogContent>
    </Dialog>
  );
};

function CreateLeagueForm({
  onSubmit,
  isPending,
}: {
  onSubmit: (values: z.infer<typeof createLeagueSchema>) => void;
  isPending?: boolean;
}) {
  const form = useForm<z.infer<typeof createLeagueSchema>>({
    resolver: zodResolver(createLeagueSchema),
    defaultValues: {
      description: CREATE_LEAGUE_DEFAULTS.description,
      startingElo: CREATE_LEAGUE_DEFAULTS.startingElo,
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="leagueName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>League name</FormLabel>
              <FormControl>
                <Input placeholder="My awesome league" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          disabled={isPending}
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>League description</FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>

              <p
                className={cn(
                  "text-xs text-slate-500 text-right",
                  (field.value?.length ?? 0) >
                    CREATE_LEAGUE_LIMITS.MAX_LEAGUE_DESCRIPTION_LENGTH &&
                    "text-red-500"
                )}
              >
                {field.value?.length ?? 0}/
                {CREATE_LEAGUE_LIMITS.MAX_LEAGUE_DESCRIPTION_LENGTH}
              </p>

              <FormDescription>
                This description will be visible to all league members.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          disabled={isPending}
          control={form.control}
          name="startingElo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Starting Elo</FormLabel>
              <FormControl>
                <Input type="number" {...field} />
              </FormControl>
              <FormDescription>
                All new players will start with this Elo rating. This can be
                changed later.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <HStack justify="end">
          <Button disabled={isPending} type="submit">
            Create league
          </Button>
        </HStack>
      </form>
    </Form>
  );
}
