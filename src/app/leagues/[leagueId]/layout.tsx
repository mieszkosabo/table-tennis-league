import { Button } from "@/components/ui/button";
import { assertLoggedIn } from "@/lib/auth";
import { assertUserInLeague, getLeague } from "@/lib/league";
import { CopyIcon } from "lucide-react";
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
          <div className="flex items-center gap-2">
            <span className="text-md text-slate-500 dark:text-slate-300 tracking-widest">
              {formatJoinCode(leagueData.joinCode)}
            </span>
            <Button variant="ghost" size="icon">
              <CopyIcon />
            </Button>
          </div>

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

function formatJoinCode(joinCode: string) {
  return (
    <>
      <span className="mr-1">
        {joinCode.slice(0, Math.floor(joinCode.length / 2))}
      </span>
      <span>{joinCode.slice(Math.floor(joinCode.length / 2))}</span>
    </>
  );
}
