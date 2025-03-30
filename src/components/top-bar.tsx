import { LeagueSelector } from "@/components/league-selector";
import { SignOutButton } from "@/components/sign-out-button";
import { assertLoggedIn } from "@/lib/auth";
import { getUserLeagues } from "@/lib/league";

export const TopBar = async () => {
  const { user } = await assertLoggedIn();
  const userLeagues = (await getUserLeagues(user.id)).map(({ league }) => ({
    id: league.id,
    name: league.name,
  }));

  return (
    <div className="flex justify-between items-center p-4 border-b">
      <div className="flex items-center space-x-4">
        {userLeagues.length === 0 ? (
          <div className="text-2xl font-semibold">🏓 Table Tennis League</div>
        ) : (
          <div className="flex gap-4 items-center">
            <div className="text-2xl font-semibold">🏓</div>
            <LeagueSelector leagues={userLeagues} />
          </div>
        )}
      </div>
      <div className="flex items-center space-x-4">
        <SignOutButton />
      </div>
    </div>
  );
};
