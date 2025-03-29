import { SignOutButton } from "@/components/sign-out-button";
import { TopBar } from "@/components/top-bar";
import { assertLoggedIn } from "@/lib/auth";

export default async function Home() {
  await assertLoggedIn();

  return (
    <div className="min-h-screen flex flex-col">
      <TopBar />
      <main className="flex-grow flex flex-col items-center justify-center text-black dark:text-white">
        <h1 className="font-semibold text-2xl mb-4">Vercel + Neon</h1>

        <SignOutButton />
      </main>
    </div>
  );
}
