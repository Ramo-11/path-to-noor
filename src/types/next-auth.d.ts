import "next-auth";

declare module "next-auth" {
  interface User {
    role?: string;
    userType?: string;
    preferredLanguage?: string;
    emailIsVerified?: boolean;
  }

  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role: string;
      userType?: string;
      preferredLanguage: string;
      emailVerified: boolean;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: string;
    userType?: string;
    preferredLanguage?: string;
    verified?: boolean;
    isActive?: boolean;
    checkedAt?: number;
  }
}
