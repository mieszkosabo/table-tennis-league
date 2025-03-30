import { redirect } from "next/navigation";

export default async function LeaguesPage({
  params,
}: {
  params: Promise<{ leagueId: string }>;
}) {
  const { leagueId } = await params;
  redirect(`/leagues/${leagueId}/ranking`);
}
