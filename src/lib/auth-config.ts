import NextAuth, { CredentialsSignin } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import bcrypt from "bcrypt";
import { connectDB } from "@/db/connection";
import { User } from "@/db/models/User";
import { clearRateLimit, rateLimitShared, getClientIp } from "@/lib/rate-limit";
import { isTrackKey } from "@/lib/tracks";

const LOGIN_WINDOW_MS = 15 * 60 * 1000;
const LOGIN_MAX_ATTEMPTS_PER_ACCOUNT = 10;
const LOGIN_MAX_ATTEMPTS_PER_IP = 30;
const REFRESH_INTERVAL_MS = 5 * 60 * 1000;
const DUMMY_HASH = "$2b$12$ho9l9IdGU9tdmYnujqlBS.NtcNIfHcTtGLOrasDBFk4XAXD2Aks1e";

class TooManySignInAttemptsError extends CredentialsSignin {
  code = "too-many-attempts";
}

const providers = [
  Credentials({
    name: "credentials",
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" },
    },
    async authorize(credentials, request) {
      if (!credentials?.email || !credentials?.password) return null;

      const email = (credentials.email as string).toLowerCase();
      const ip = getClientIp(request.headers);

      const ipCheck = await rateLimitShared(`login-ip:${ip}`, LOGIN_MAX_ATTEMPTS_PER_IP, LOGIN_WINDOW_MS);
      const accountKey = `login-account:${email}:${ip}`;
      const accountCheck = await rateLimitShared(accountKey, LOGIN_MAX_ATTEMPTS_PER_ACCOUNT, LOGIN_WINDOW_MS);
      if (!ipCheck.success || !accountCheck.success) {
        throw new TooManySignInAttemptsError();
      }

      await connectDB();
      const user = await User.findOne({
        email,
      }).select("+password");

      const passwordValid = await bcrypt.compare(
        credentials.password as string,
        user?.password ?? DUMMY_HASH
      );

      if (!user || !user.isActive || !user.password || !passwordValid) return null;

      await clearRateLimit(accountKey);

      return {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        userType: user.userType || undefined,
        track: user.track || undefined,
        preferredLanguage: user.preferredLanguage,
        emailIsVerified: Boolean(user.emailVerified),
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
    }) as never
  );
}

type FreshUser = {
  _id: { toString(): string };
  role: string;
  isActive: boolean;
  userType?: string;
  track?: string;
  preferredLanguage: string;
  emailVerified?: Date | null;
};

function applyFresh(token: import("next-auth/jwt").JWT, dbUser: FreshUser) {
  token.id = dbUser._id.toString();
  token.role = dbUser.role;
  token.isActive = dbUser.isActive;
  token.userType = dbUser.userType || undefined;
  token.track = isTrackKey(dbUser.track) ? dbUser.track : undefined;
  token.preferredLanguage = dbUser.preferredLanguage;
  token.verified = Boolean(dbUser.emailVerified);
  token.checkedAt = Date.now();
}

const FRESH_FIELDS = "role isActive userType track preferredLanguage emailVerified";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers,
  trustHost: true,

  pages: {
    signIn: "/login",
    error: "/login",
  },

  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60, // 7 days
    updateAge: 24 * 60 * 60, // rotate JWT once per day
  },

  callbacks: {
    async jwt({ token, user, account, trigger, session }) {
      if (user) {
        if (account?.provider === "google") {
          try {
            await connectDB();
            const dbUser = await User.findOne({ email: user.email?.toLowerCase() })
              .select(FRESH_FIELDS)
              .lean<FreshUser>();
            if (dbUser) applyFresh(token, dbUser);
          } catch {
            return token;
          }
        } else {
          token.role = user.role;
          token.id = user.id;
          token.userType = user.userType;
          token.track = isTrackKey(user.track) ? user.track : undefined;
          token.preferredLanguage = user.preferredLanguage;
          token.verified = Boolean(user.emailIsVerified);
          token.isActive = true;
          token.checkedAt = Date.now();
        }
        return token;
      }

      if (!token.id) return token;

      if (trigger === "update") {
        if (session?.userType) token.userType = session.userType;
        if (session && typeof session === "object" && "track" in session) {
          token.track = isTrackKey(session.track) ? session.track : undefined;
        }
        if (session?.preferredLanguage) token.preferredLanguage = session.preferredLanguage;
        token.checkedAt = 0;
      }

      const stale = !token.checkedAt || Date.now() - token.checkedAt > REFRESH_INTERVAL_MS;
      if (stale) {
        try {
          await connectDB();
          const dbUser = await User.findById(token.id).select(FRESH_FIELDS).lean<FreshUser>();
          if (!dbUser || !dbUser.isActive) return null;
          applyFresh(token, dbUser);
        } catch {
          return token;
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
        session.user.track = isTrackKey(token.track) ? token.track : undefined;
        Object.assign(session.user, { emailVerified: Boolean(token.verified) });
      }
      return session;
    },

    async signIn({ user, account, profile }) {
      if (account?.provider === "google") {
        const email = user.email?.toLowerCase();
        if (!email || profile?.email_verified === false) return false;
        try {
          await connectDB();
          const existingUser = await User.findOne({ email }).select("+password");

          if (!existingUser) {
            await User.create({
              email,
              name: user.name || email,
              image: user.image || undefined,
              role: "user",
              isActive: true,
              preferredLanguage: "en",
              emailVerified: new Date(),
              accounts: [
                {
                  provider: "google",
                  providerAccountId: account.providerAccountId,
                },
              ],
            });
          } else if (!existingUser.isActive) {
            return false;
          } else if (!existingUser.emailVerified) {
            const update: Record<string, unknown> = { $set: { emailVerified: new Date() } };
            if (existingUser.password) update.$unset = { password: 1 };
            await User.updateOne({ _id: existingUser._id }, update);
          }
        } catch (error) {
          console.error("[Auth] Google signIn callback error:", error);
          return false;
        }
      }
      return true;
    },
  },
});
