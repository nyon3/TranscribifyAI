import NextAuth from "next-auth/next";
import GithubProvider from "next-auth/providers/github";
import GoogleProvider from 'next-auth/providers/google';
import { PrismaAdapter } from "@auth/prisma-adapter"
import prisma from '@/lib/prisma'
import type { NextAuthOptions } from "next-auth";
import { redirect } from "next/navigation";

export const authOptions: NextAuthOptions = {
  // Configure one or more authentication providers
  adapter: PrismaAdapter(prisma),
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID as string,
      clientSecret: process.env.GITHUB_SECRET as string,
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
    // ...add more providers here
  ],
  session: {
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async session({ session, user }) {
      if (session && session.user && user) {
        (session.user as any).id = user.id;
        (session.user as any).apiRequestCount = (user as any).apiRequestCount;
        (session.user as any).isAdmin = (user as any).isAdmin;
      }
      return session;
    },
    async signIn({ user }) {
      if ((user as any).email === 'tomoya@crosstalk.me') {
        await prisma.user.update({
          where: { email: 'tomoya@crosstalk.me' },
          data: { isAdmin: true },
        });
      }
      return true;
    }
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
