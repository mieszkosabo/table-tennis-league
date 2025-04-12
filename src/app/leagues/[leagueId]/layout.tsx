import { InviteButton } from "@/components/ui/invite-button";
import { HStack, VStack } from "@/components/ui/stack";
import { assertLoggedIn } from "@/lib/auth";
import { assertUserInLeague, getLeague } from "@/lib/league";
import { redirect } from "next/navigation";

export default async function LeaguePageLayout({
  params,
  children,
}: {
  children: React.ReactNode;
  params: Promise<{ leagueId: string }>;
}) {
  const { user } = await assertLoggedIn();
  const { leagueId } = await params;
  const leagueData = await getLeague(leagueId);
  if (!leagueData || !assertUserInLeague(user.id, leagueData)) {
    return redirect("/");
  }

  return (
    <div className="min-h-screen flex flex-col">
      <VStack className="gap-2">
        <VStack className="mb-8 gap-4">
          <HStack align="center" justify="between">
            <h2 className="text-5xl font-bold text-slate-700 dark:text-slate-100">
              {leagueData.name}
            </h2>

            <InviteButton joinCode={leagueData.joinCode} />
          </HStack>

          <p className="text-slate-500 dark:text-slate-400">
            {leagueData.description}
          </p>
        </VStack>

        {children}
      </VStack>
    </div>
  );
}
