import NextAuth from "next-auth/next";
import GithubProvider from "next-auth/providers/github";
import { PrismaAdapter } from "@auth/prisma-adapter"
import prisma from '@/lib/prisma'
import type { NextAuthOptions } from "next-auth";

export const authOptions: NextAuthOptions = {
  // Configure one or more authentication providers
  adapter: PrismaAdapter(prisma),
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
  })
    // ...add more providers here
  ],
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
     async session({session, user, token}) {
      session.user.id = user.id;
      return session;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
