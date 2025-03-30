import { CreateLeagueButton } from "@/components/create-league-button";
import { JoinLeagueButton } from "@/components/join-league-button";
import { assertLoggedIn } from "@/lib/auth";
import { getUserLeagues } from "@/lib/league";
import { redirect } from "next/navigation";

export const Main = async () => {
  const { user } = await assertLoggedIn();
  const userLeagues = await getUserLeagues(user.id);

  console.log(userLeagues);
  if (userLeagues.length > 0) {
    redirect(`/leagues/${userLeagues[0].league.id}`);
  }

  // user is new, so show the welcome screen
  return (
    <main className="flex-grow flex flex-col items-center mt-32 text-black dark:text-white">
      <div>
        <h1 className="text-3xl text-slate-800 mb-2 font-bold">
          Welcome, {user.name}!
        </h1>
        <p className="text-slate-500">
          It looks like you haven&apos;t joined any leagues yet.
        </p>
        <div className="flex items-center mt-8 gap-4">
          <JoinLeagueButton />
          <CreateLeagueButton />
        </div>
      </div>
    </main>
  );
};
