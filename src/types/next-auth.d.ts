import "next-auth";

declare module "next-auth" {
  interface User {
    role?: string;
    preferredLanguage?: string;
  }

  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role: string;
      preferredLanguage: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: string;
    preferredLanguage?: string;
  }
}
