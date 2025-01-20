import NextAuth from "next-auth";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcrypt";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import DiscordProvider from "next-auth/providers/discord";
import CredentialsProvider from "next-auth/providers/credentials";

import MongooseAdapter from "@/libs/database/mongoose/mongooseAdapter";
import db from "@/libs/database/mongoose/mongooseConnect";
import User from "@/libs/database/mongoose/models/user/user";
import Session from "@/libs/database/mongoose/models/user/session";
import { decryptSessionMetadata } from "@/libs/utils/session-metadata-cookie";

export const authOptions = {
  adapter: MongooseAdapter(db()),
  providers: [
    GoogleProvider({
      clientId: process.env.AUTH_GOOGLE_ID as string,
      clientSecret: process.env.AUTH_GOOGLE_SECRET as string,
    }),
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
          scope:
            "identify guilds guilds.channels.read gdm.join guilds.join email connections guilds.members.read",
        },
      },
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "email", type: "text" },
        password: { label: "password", type: "password" },
      },
      async authorize(credentials, req) {
        try {
          if (!credentials?.email || !credentials?.password) {
            throw new Error("Missing credentials");
          }

          await db();
          const user = await User.findOne(
            { email: credentials.email },
            {
              _id: 1,
              name: 1,
              email: 1,
              password: 1,
              picture: 1,
              isAdmin: 1,
              integrations: 1,
            }
          );

          if (!user) {
            throw new Error("User not found");
          }

          const isCorrectPassword = await bcrypt.compare(
            credentials.password as string,
            user.password
          );

          if (!isCorrectPassword) {
            throw new Error("Invalid password");
          }

          return {
            _id: user._id,
            name: user.name,
            email: user.email,
            picture: user.picture,
            integrations: user?.integrations || null,
            isAdmin: user.isAdmin,
          };
        } catch (e) {
          console.error("Authorize Error: ", e.message);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    jwt: async ({ token, user, account }) => {
      // Si c'est une nouvelle connexion ou association de compte
      if (user) {
        token.isAdmin = user.isAdmin;
        token.integrations = user.integrations;
        token._id = user._id;
        token.jwt = user.jwt;
      }
      return token;
    },

    async session({ session, token }) {
      session._id = token._id;
      session.isAdmin = token.isAdmin;

      session.user._id = token.isAdmin;
      session.user.isAdmin = token.isAdmin;
      session.user.integrations = token.integrations;
      session.jwt = token.jwt;

      return session;
    },
    async signIn({ user, account, profile }) {
      try {
        const sessionToken = uuidv4(); // Générer un UUID unique
        const expires = new Date();
        expires.setDate(expires.getDate() + 30); // Expire dans 30 jours

        // Lire le cookie contenant les métadonnées
        let metadata = {};
        try {
          metadata = await decryptSessionMetadata(); // Fonction personnalisée pour décrypter les cookies sécurisés
        } catch (error) {
          console.warn(
            "Failed to decrypt session metadata cookie:",
            error.message
          );
        }

        const { ip, browser, device, type, os, location } = metadata;

        // Vérification et valeurs par défaut
        const metadataDefaults = {
          ip: "127.0.0.1",
          browser: "Unknown Browser",
          device: "Unknown Device",
          type: "desktop",
          os: "Unknown OS",
          location: "Unknown Location",
        };

        const sessionData = {
          sessionToken,
          userId: user._id,
          device: device || metadataDefaults.device,
          browser: browser || metadataDefaults.browser,
          location: location || metadataDefaults.location,
          ip: ip || metadataDefaults.ip,
          type: type || metadataDefaults.type,
          os: os || metadataDefaults.os,
          expires,
          provider: account?.provider || "Unknown provider",
        };

        // Gestion des connexions par fournisseur
        const supportedProviders = [
          "credentials",
          "google",
          "discord",
          "github",
        ];
        if (
          account?.provider &&
          supportedProviders.includes(account.provider)
        ) {
          await Session.create(sessionData);
        }

        return true;
      } catch (error) {
        console.error("Error in signIn callback:", error);
        return false;
      }
    },
  },

  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 jours
    updateAge: 24 * 60 * 60, // 24 heures
  },
  secret: process.env.NEXTAUTH_SECRET as string,

  trustHost: true,
  pages: {
    signIn: "/auth/sign-in",
    signUp: "/auth/sign-up",
    signOut: "/",
    error: "/auth/error",
  },
};

export const { handlers, auth } = NextAuth(authOptions);
export const { GET, POST } = handlers;
