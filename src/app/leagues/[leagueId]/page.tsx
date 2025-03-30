import { assertLoggedIn } from "@/lib/auth";
import { getLeague } from "@/lib/league";

export default async function LeaguesPage({
  params,
}: {
  params: Promise<{ leagueId: string }>;
}) {
  await assertLoggedIn();
  const { leagueId } = await params;
  const leagueData = await getLeague(leagueId);

  return (
    <div className="min-h-screen flex flex-col">
      hello from league {leagueId}
      <pre>{JSON.stringify(leagueData, null, 2)}</pre>
    </div>
  );
}
