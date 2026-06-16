import type { NextAuthConfig } from "next-auth";

/**
 * Edge-safe auth config (no Prisma / bcrypt imports here).
 * Used by middleware for route protection.
 */
export const authConfig = {
  pages: {
    signIn: "/login",
  },
  session: { strategy: "jwt" },
  trustHost: true,
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id as string;
        token.role = (user as { role?: string }).role;
        token.username = (user as { username?: string }).username;
        token.scoutGroupId = (user as { scoutGroupId?: string | null }).scoutGroupId ?? null;
        token.scoutGroupName = (user as { scoutGroupName?: string | null }).scoutGroupName ?? null;
        token.name = user.name;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as "ADMIN" | "GROUP";
        session.user.username = token.username as string;
        session.user.scoutGroupId = (token.scoutGroupId as string | null) ?? null;
        session.user.scoutGroupName = (token.scoutGroupName as string | null) ?? null;
      }
      return session;
    },
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const { pathname } = nextUrl;

      const isPublic =
        pathname === "/login" ||
        pathname === "/" ||
        pathname.startsWith("/api/auth");

      // Admin-only sections.
      const isAdminArea = pathname.startsWith("/admin");

      if (isPublic) {
        // Already-authenticated users shouldn't see the login page.
        if (isLoggedIn && pathname === "/login") {
          return Response.redirect(new URL("/dashboard", nextUrl));
        }
        return true;
      }

      if (!isLoggedIn) {
        const url = new URL("/login", nextUrl);
        url.searchParams.set("callbackUrl", pathname);
        return Response.redirect(url);
      }

      if (isAdminArea && auth?.user?.role !== "ADMIN") {
        return Response.redirect(new URL("/dashboard", nextUrl));
      }

      return true;
    },
  },
  providers: [], // defined in auth.ts (Node runtime)
} satisfies NextAuthConfig;
