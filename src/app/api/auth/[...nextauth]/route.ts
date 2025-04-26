import { authOptions } from "@/app/api/auth/auth";
import NextAuth from "next-auth";

// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unnecessary-type-assertion, @typescript-eslint/no-unsafe-assignment
const handler = NextAuth(authOptions) as any;

export { handler as GET, handler as POST };
