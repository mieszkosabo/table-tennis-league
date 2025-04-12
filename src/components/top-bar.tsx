import { ModeToggle } from "@/components/color-theme-toggle";
import { LeagueSelector } from "@/components/league-selector";
import { ProfileButton } from "@/components/profile-button";
import { env } from "@/env/server";
import { assertLoggedIn } from "@/lib/auth";
import { getUserLeagues } from "@/lib/league";

export const TopBar = async () => {
  const { user } = await assertLoggedIn();
  const userLeagues = (await getUserLeagues(user.id)).map(({ league }) => ({
    id: league.id,
    name: league.name,
  }));

  return (
    <div className="flex w-screen border-b md:sticky top-0 bg-background dark:border-slate-800 z-10">
      <div className="flex w-full justify-center">
        <div className="flex w-full max-w-screen-lg items-center justify-between p-4 ">
          <div className="flex items-center space-x-4">
            {userLeagues.length === 0 ? (
              <div className="text-2xl font-semibold">
                🏓 Table Tennis League
              </div>
            ) : (
              <div className="flex gap-4 items-center">
                <div className="text-2xl font-semibold">🏓</div>
                <LeagueSelector leagues={userLeagues} />
              </div>
            )}
          </div>
          <div className="flex items-center space-x-4">
            {env.FEEDBACK_LINK && (
              <a
                className="text-sm text-fuchsia-900 dark:text-fuchsia-100"
                href={env.FEEDBACK_LINK}
              >
                Send feedback
              </a>
            )}
            <ModeToggle />
            <ProfileButton user={user} />
          </div>
        </div>
      </div>
    </div>
  );
};
