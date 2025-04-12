import { LeagueCode } from "@/components/ui/league-code";
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
      <div className="flex flex-col gap-2">
        <div className="flex flex-col mb-8 gap-4">
          <LeagueCode joinCode={leagueData.joinCode} />

          <h2 className="text-5xl font-bold text-slate-700 dark:text-slate-100">
            {leagueData.name}
          </h2>

          <p className="text-slate-500 dark:text-slate-400">
            {leagueData.description}
          </p>
        </div>

        {children}
      </div>
    </div>
  );
}
