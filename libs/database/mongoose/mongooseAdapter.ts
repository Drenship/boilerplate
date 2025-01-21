import mongoose, { Mongoose, Model } from "mongoose";
import type {
  Adapter,
  AdapterUser,
  AdapterSession,
  VerificationToken as AdapterVerificationToken,
} from "next-auth/adapters";
import type { Account as AdapterAccount } from "next-auth";
import Session from "@/libs/database/mongoose/models/user/session";
import redisClient from "@/libs/config/redis.config";

interface MongooseAdapterModels {
  user?: Model<AdapterUser>;
  session?: Model<AdapterSession>;
  account?: Model<AdapterAccount>;
  verificationToken?: Model<AdapterVerificationToken>;
}

const MongooseAdapter = (
  dbConnect: Promise<Mongoose>,
  models?: MongooseAdapterModels
): Adapter => {
  // Ensure Models are Loaded
  if (!mongoose.models.User) {
    require("./models/user/user");
  }

  if (!mongoose.models.Session) {
    require("./models/user/session");
  }

  if (!mongoose.models.VerificationToken) {
    require("./models/user/verificationToken");
  }

  if (!mongoose.models.Account) {
    require("./models/user/account");
  }

  // Models
  const User: Model<AdapterUser> = mongoose.models.User;
  const VerificationToken: Model<AdapterVerificationToken> =
    mongoose.models.VerificationToken;
  const Account: Model<AdapterAccount> = mongoose.models.Account;

  // Adapter Methods
  const adapterMethods: Adapter = {
    async createUser(data) {
      await dbConnect;
      return User.create(data);
    },

    async getUser(id) {
      await dbConnect;
      const cacheKey = `user:${id}`;

      if (!redisClient.isOpen) {
        await redisClient.connect();
      }

      // Vérifier Redis
      const cachedUser = await redisClient.get(cacheKey);
      if (cachedUser) return JSON.parse(cachedUser) as AdapterUser;

      // Récupérer depuis MongoDB
      const user = await User.findById(id);
      if (user) {
        await redisClient.set(cacheKey, JSON.stringify(user), "EX", 3600); // Cache pour 1h
      }
      return user;
    },

    async getUserByEmail(email) {
      await dbConnect;
      const cacheKey = `user:email:${email}`;

      if (!redisClient.isOpen) {
        await redisClient.connect();
      }

      // Vérifier Redis
      const cachedUser = await redisClient.get(cacheKey);
      if (cachedUser) return JSON.parse(cachedUser) as AdapterUser;

      // Récupérer depuis MongoDB
      const user = await User.findOne({ email });
      if (user) {
        await redisClient.set(cacheKey, JSON.stringify(user), "EX", 3600); // Cache pour 1h
      }
      return user;
    },

    async getUserByAccount({ providerAccountId, provider }) {
      await dbConnect;
      const cacheKey = `account:${provider}:${providerAccountId}`;

      if (!redisClient.isOpen) {
        await redisClient.connect();
      }
      // Vérifier Redis
      const cachedAccount = await redisClient.get(cacheKey);
      if (cachedAccount) {
        const userId = JSON.parse(cachedAccount).userId;
        return adapterMethods.getUser(userId);
      }

      // Récupérer depuis MongoDB
      const account = await Account.findOne({ providerAccountId, provider });
      if (account) {
        await redisClient.set(cacheKey, JSON.stringify(account), "EX", 3600); // Cache pour 1h
        return adapterMethods.getUser(account.userId);
      }
      return null;
    },

    async getSessionAndUser(sessionToken) {
      await dbConnect;
      const cacheKey = `session:${sessionToken}`;

      if (!redisClient.isOpen) {
        await redisClient.connect();
      }
      // Vérifier Redis
      const cachedSession = await redisClient.get(cacheKey);
      if (cachedSession) {
        return JSON.parse(cachedSession) as {
          session: AdapterSession;
          user: AdapterUser;
        };
      }

      // Récupérer depuis MongoDB
      const session = await Session.findOne({ sessionToken });
      if (!session) return null;

      const user = await adapterMethods.getUser(session.userId);
      if (!user) return null;

      const sessionData = { session, user };
      await redisClient.set(cacheKey, JSON.stringify(sessionData), "EX", 3600); // Cache pour 1h
      return sessionData;
    },

    async createSession(data) {
      await dbConnect;
      const session = await Session.create(data);

      if (!redisClient.isOpen) {
        await redisClient.connect();
      }
      // Stocker dans Redis
      const cacheKey = `session:${data.sessionToken}`;
      await redisClient.set(
        cacheKey,
        JSON.stringify({ session, user: null }),
        "EX",
        3600
      );

      return session;
    },

    async updateSession({ sessionToken, ...data }) {
      await dbConnect;
      const session = await Session.findOneAndUpdate({ sessionToken }, data, {
        new: true,
        runValidators: true,
      });

      if (!redisClient.isOpen) {
        await redisClient.connect();
      }
      // Mettre à jour Redis
      const cacheKey = `session:${sessionToken}`;
      if (session) {
        await redisClient.set(
          cacheKey,
          JSON.stringify({ session, user: null }),
          "EX",
          3600
        );
      } else {
        await redisClient.del(cacheKey);
      }

      return session;
    },

    async deleteSession(sessionToken) {
      await dbConnect;

      if (!redisClient.isOpen) {
        await redisClient.connect();
      }
      await redisClient.del(`session:${sessionToken}`); // Supprimer du cache Redis
      return Session.findOneAndDelete({ sessionToken });
    },

    async linkAccount(data) {
      await dbConnect;
      const account = await Account.create(data);

      // Stocker dans Redis
      const cacheKey = `account:${data.provider}:${data.providerAccountId}`;
      await redisClient.set(cacheKey, JSON.stringify(account), "EX", 3600);

      return account;
    },

    async unlinkAccount({ providerAccountId, provider }) {
      await dbConnect;
      const account = await Account.findOneAndDelete({
        providerAccountId,
        provider,
      });

      if (!redisClient.isOpen) {
        await redisClient.connect();
      }
      // Supprimer du cache Redis
      const cacheKey = `account:${provider}:${providerAccountId}`;
      await redisClient.del(cacheKey);

      return account;
    },

    async useVerificationToken({ identifier, token }) {
      await dbConnect;
      const verificationToken = await VerificationToken.findOne({
        identifier,
        token,
      });
      if (verificationToken) {
        await VerificationToken.deleteOne({ identifier, token });
      }
      return verificationToken;
    },
  };

  return adapterMethods;
};

export default MongooseAdapter;