import { assertLoggedIn } from "@/lib/auth";
import { getLeague } from "@/lib/league";

export default async function LeaguePageLayout({
  params,
  children,
}: {
  children: React.ReactNode;
  params: Promise<{ leagueId: string }>;
}) {
  await assertLoggedIn();
  const { leagueId } = await params;
  const leagueData = await getLeague(leagueId);
  if (!leagueData) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col p-16">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold text-slate-700">{leagueData.name}</h2>
        <div className="text-md text-slate-500 tracking-widest mb-6">
          {formatJoinCode(leagueData.joinCode)}
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
