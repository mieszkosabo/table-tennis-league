import { CREATE_LEAGUE_LIMITS } from "@/app/features/league-management/consts";
import {
  createLeagueSchema,
  type editLeagueSchema,
} from "@/app/features/league-management/schemas";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { HStack } from "@/components/ui/stack";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import type { z } from "zod";

export function CreateEditLeagueForm({
  onSubmit,
  isPending,
  defaults,
  isEdit = false,
}: {
  onSubmit: (
    values: z.infer<typeof createLeagueSchema | typeof editLeagueSchema>,
  ) => void;
  isPending?: boolean;
  defaults: Partial<
    z.infer<typeof createLeagueSchema | typeof editLeagueSchema>
  >;
  isEdit?: boolean;
}) {
  const form = useForm({
    // @ts-expect-error FIXME: look later into this
    resolver: zodResolver(createLeagueSchema),
    defaultValues: defaults,
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
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
                    "text-red-500",
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
            {isEdit ? "Edit league" : "Create league"}
          </Button>
        </HStack>
      </form>
    </Form>
  );
}
