import { db } from "@/db/db";
import { accounts, sessions, users } from "@/db/schema/users";
import { env } from "@/env/server";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { eq } from "drizzle-orm";
import NextAuth, { type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GithubProvider from "next-auth/providers/github";

// we allow login in with just username for development purposes
// to test the app with multiple users
export const authOptions = {
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
  }),
  session: {
    strategy: process.env.NODE_ENV === "development" ? "jwt" : "database",
  },
  providers: [
    GithubProvider({
      clientId: env.GITHUB_ID,
      clientSecret: env.GITHUB_SECRET,
    }),
    process.env.NODE_ENV === "development"
      ? CredentialsProvider({
          name: "Dev login",
          credentials: {
            username: { label: "Username", type: "text" },
          },
          async authorize(credentials) {
            if (!credentials) {
              return null;
            }

            const user = await db.query.users.findFirst({
              where: eq(users.name, credentials.username),
            });

            if (!user) {
              const res = await db
                .insert(users)
                .values({
                  email: `${credentials.username}@example.com`,
                  name: credentials.username,
                })
                .returning({
                  id: users.id,
                  name: users.name,
                  email: users.email,
                });

              return res[0];
            }

            return user;
          },
        })
      : null,
  ].filter((x) => x !== null),

  callbacks: {
    session({ session, user, token }) {
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      if (user) {
        session.user.id = user.id;
      } else {
        session.user.id = token.id as string;
      }

      return session;
    },
    jwt({ token, user }) {
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      if (user) {
        token.id = user.id;
      }

      return token;
    },
  },
} satisfies NextAuthOptions;

const handler = NextAuth(authOptions) as unknown;

export { handler as GET, handler as POST };
