import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import bcrypt from "bcrypt";
import { connectDB } from "@/db/connection";
import { User } from "@/db/models/User";

const providers = [
  Credentials({
    name: "credentials",
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" },
    },
    async authorize(credentials) {
      if (!credentials?.email || !credentials?.password) return null;

      await connectDB();
      const user = await User.findOne({
        email: (credentials.email as string).toLowerCase(),
      }).select("+password");

      if (!user || !user.isActive || !user.password) return null;

      const passwordValid = await bcrypt.compare(
        credentials.password as string,
        user.password
      );
      if (!passwordValid) return null;

      return {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        userType: user.userType || undefined,
        preferredLanguage: user.preferredLanguage,
      };
    },
  }),
];

// Only add Google provider if credentials are configured
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }) as any
  );
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers,

  pages: {
    signIn: "/en/login",
    error: "/en/login",
  },

  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  callbacks: {
    async jwt({ token, user, account, trigger }) {
      if (user) {
        if (account?.provider === "google") {
          // Google sign-in: look up the DB user to get custom fields
          try {
            await connectDB();
            const dbUser = await User.findOne({ email: user.email })
              .select("role userType preferredLanguage")
              .lean();
            if (dbUser) {
              token.id = dbUser._id.toString();
              token.role = dbUser.role;
              token.userType = (dbUser as { userType?: string }).userType;
              token.preferredLanguage = dbUser.preferredLanguage;
            }
          } catch {
            // Silently continue
          }
        } else {
          token.role = user.role;
          token.id = user.id;
          token.userType = user.userType;
          token.preferredLanguage = user.preferredLanguage;
        }
      }

      // Refresh from DB when session is explicitly updated
      if (trigger === "update" && token.id) {
        try {
          await connectDB();
          const dbUser = await User.findById(token.id).select("role userType preferredLanguage").lean();
          if (dbUser) {
            token.role = dbUser.role;
            token.userType = (dbUser as { userType?: string }).userType;
            token.preferredLanguage = dbUser.preferredLanguage;
          }
        } catch {
          // Silently continue with cached token values
        }
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as string;
        session.user.id = token.id as string;
        session.user.userType = token.userType as string | undefined;
        session.user.preferredLanguage = token.preferredLanguage as string;
      }
      return session;
    },

    async signIn({ user, account }) {
      if (account?.provider === "google") {
        await connectDB();
        const existingUser = await User.findOne({ email: user.email });

        if (!existingUser && user.email) {
          await User.create({
            email: user.email,
            name: user.name || user.email,
            image: user.image || undefined,
            role: "user",
            isActive: true,
            preferredLanguage: "en",
            accounts: [
              {
                provider: "google",
                providerAccountId: account.providerAccountId,
              },
            ],
          });
        }
      }
      return true;
    },
  },
});
