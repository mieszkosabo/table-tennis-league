import { db } from "@/db/db";
import { accounts, sessions, users } from "@/db/schema/users";
import { env } from "@/env/server";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import NextAuth, { type NextAuthOptions } from "next-auth";
import GithubProvider from "next-auth/providers/github";

export const authOptions = {
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
  }),
  providers: [
    GithubProvider({
      clientId: env.GITHUB_ID,
      clientSecret: env.GITHUB_SECRET,
    }),
  ],
} satisfies NextAuthOptions;

const handler = NextAuth(authOptions) as unknown;

export { handler as GET, handler as POST };
