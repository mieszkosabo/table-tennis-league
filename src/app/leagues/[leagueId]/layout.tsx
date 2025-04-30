import { LeagueSettingsButton } from "@/components/league-settings-button";
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
  const isUserOwner = leagueData.ownerId === user.id;

  return (
    <div className="min-h-screen flex flex-col">
      <VStack className="gap-2">
        <VStack className="mb-8 gap-4">
          <HStack align="center" justify="between">
            <h2 className="sm:text-5xl sm:leading-tight text-2xl font-bold text-slate-700 dark:text-slate-100 truncate">
              {leagueData.name}
            </h2>

            <HStack className="gap-2">
              <InviteButton joinCode={leagueData.joinCode} />
              <LeagueSettingsButton
                leagueData={leagueData}
                isOwner={isUserOwner}
                currentUserId={user.id}
              />
            </HStack>
          </HStack>

          <div className="text-slate-500 dark:text-slate-400 whitespace-pre max-h-32 overflow-hidden">
            {leagueData.description}
          </div>
        </VStack>

        {children}
      </VStack>
    </div>
  );
}
