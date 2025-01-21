import type { NextAuthConfig } from "next-auth";
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import DiscordProvider from "next-auth/providers/discord";

export const authOptions: any = {
  providers: [
    GoogleProvider,
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      allowDangerousEmailAccountLinking: true, // Permet de lier plusieurs comptes
      authorization: {
        params: {
          scope: "repo read:user",
        },
      },
    }),
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID,
      clientSecret: process.env.DISCORD_CLIENT_SECRET,
      authorization: {
        params: {
          scope: "identify guilds bot guilds.join guilds.members.read",
        },
      },
    }),
  ],
  callbacks: {
    jwt: async ({ token, user, account }) => {
      if (user) {
        token.isAdmin = user.isAdmin;
        token._id = user._id;
        token.jwt = user.jwt || "default-jwt";
      }
      return token;
    },
    session: async ({ session, token }) => {
      session._id = token._id || "";
      session.jwt = token.jwt || "default-jwt";
      session.user = {
        ...session.user,
        _id: token._id || "",
        isAdmin: token.isAdmin || false,
      };

      return session;
    },

  },
  trustHost: true,
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 jours
    updateAge: 24 * 60 * 60, // 24 heures
  },
  secret: process.env.NEXTAUTH_SECRET,
} satisfies NextAuthConfig;

export const { handlers, auth, signIn, signOut } = NextAuth(authOptions);
