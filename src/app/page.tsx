import { Main } from "@/components/main";
import { assertLoggedIn } from "@/lib/auth";

export default async function Home() {
  await assertLoggedIn();

  return <Main />;
}
