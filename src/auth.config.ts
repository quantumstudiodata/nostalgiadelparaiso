import type { NextAuthConfig } from "next-auth";

// Edge-safe config: no providers that touch Prisma/bcrypt here.
// Used directly by middleware; extended with the Credentials provider in auth.ts.
export const authConfig = {
  session: { strategy: "jwt" },
  pages: {
    signIn: "/admin/login",
  },
  providers: [],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as "ADMIN" | "EDITOR";
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
