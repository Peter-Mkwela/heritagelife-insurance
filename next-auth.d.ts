import NextAuth from "next-auth";

// Extend NextAuth types
declare module "next-auth" {
  interface User {
    role: string; // Add role to the user
  }

  interface Session {
    user: {
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role: string; // Add role to the session
    };
  }
}
