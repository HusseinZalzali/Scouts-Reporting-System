import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    role?: "ADMIN" | "GROUP";
    username?: string;
    scoutGroupId?: string | null;
    scoutGroupName?: string | null;
  }

  interface Session {
    user: {
      id: string;
      role: "ADMIN" | "GROUP";
      username: string;
      scoutGroupId: string | null;
      scoutGroupName: string | null;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: "ADMIN" | "GROUP";
    username: string;
    scoutGroupId: string | null;
    scoutGroupName: string | null;
  }
}
