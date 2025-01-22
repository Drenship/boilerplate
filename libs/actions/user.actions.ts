"use server";
import { z } from "zod";
import crypto from "crypto";
import dbConnect from "@/libs/database/mongoose/mongooseConnect";
import User from "@/libs/database/mongoose/models/user/user";
import Session from "@/libs/database/mongoose/models/user/session";
import { sendEmailVerification } from "@/libs/config/resend.config";
import { useServerAction } from "@/libs/hooks/server/useServerAction";

export const getUser = useServerAction({
  role: ["USER"], // Rôles requis
  action: async (_, session) => {
    try {
      // Connexion à la base de données
      await dbConnect();

      // Recherche de l'utilisateur dans la base de données via l'ID de session
      const user = await User.findById(session._id)
        .select(
          "-password -passwordResetToken -passwordResetExpires -passwordResetRequestTimestamp -emailVerification.verificationToken -emailVerification.verificationTokenExpires -security"
        )
        .lean();

      if (!user) {
        return { failure: "User not found" };
      }

      // Retourne les informations de l'utilisateur
      return { success: true, user: JSON.parse(JSON.stringify(user)) };
    } catch (error) {
      // Gestion des erreurs
      return { failure: "Error fetching user", error: error.message };
    }
  },
});
// Mettre à jour les informations de l'utilisateur
export const putUser = useServerAction({
  role: "USER",
  action: async (updatedData: Partial<typeof User>, session) => {
    try {
      // Connexion à la base de données
      await dbConnect();

      // Liste des champs à exclure de la mise à jour
      const excludedFields: string[] = [
        "isAdmin",
        "emailVerification",
        "passwordResetToken",
        "passwordResetExpires",
        "passwordResetRequestTimestamp",
        "createdAt",
        "updatedAt",
        "_id",
      ];

      // Filtrer les champs exclus
      const filteredData = Object.keys(updatedData).reduce(
        (acc, key) => {
          if (!excludedFields.includes(key)) {
            acc[key] = updatedData[key];
          }
          return acc;
        },
        {} as Partial<typeof User>
      );

      // Recherche et mise à jour de l'utilisateur
      const user = await User.findByIdAndUpdate(
        session._id,
        { $set: filteredData },
        { new: true } // Retourne le nouvel utilisateur mis à jour
      ).lean();

      // Si l'utilisateur n'existe pas dans la base de données
      if (!user) {
        return { failure: "User not found" };
      }

      // Retourne l'utilisateur mis à jour
      return { success: true, user: JSON.parse(JSON.stringify(user)) };
    } catch (error) {
      // Gestion des erreurs
      return { failure: "Error updating user", error: error.message };
    }
  },
});

export const createAndSendEmailVerification = useServerAction({
  role: ["USER"], // Rôles requis
  action: async (_, session) => {
    try {
      // Connexion à la base de données
      await dbConnect();
      // Récupérer l'utilisateur
      const user = await User.findById(session._id);

      if (!user) {
        return { failure: "User not found" };
      }

      if (user.emailVerification.isVerified === true) {
        return { failure: "User is already verified" };
      }

      // Générer un token de vérification
      const verificationToken = crypto.randomBytes(32).toString("hex");
      const verificationTokenExpires = new Date(
        Date.now() + 24 * 60 * 60 * 1000
      ); // Expire dans 24 heures

      // Mettre à jour l'utilisateur avec le token
      user.emailVerification = {
        verificationToken,
        verificationTokenExpires,
        isVerified: false,
      };

      await user.save();

      // Construire le lien de vérification
      const verificationLink = `${process.env.NEXT_PUBLIC_BASE_URL}/api/user/emails/verify?token=${verificationToken}`;

      // Envoyer l'email de vérification
      await sendEmailVerification({
        to: user.email,
        subject: "Verify your email address",
        verificationLink,
      });

      return { success: true, message: "Verification email sent" };
    } catch (error) {
      console.error("Error creating and sending email verification:", error);
      return { failure: "Error creating verification", error: error.message };
    }
  },
});

export const verifyEmailToken = useServerAction({
  schema: z.object({
    token: z.string().min(8, "Token is required"), // Schéma de validation
  }),
  action: async ({ token }, session) => {
    try {
      // Connexion à la base de données
      await dbConnect();

      // Rechercher l'utilisateur par token
      const user = await User.findOne({
        "emailVerification.verificationToken": token,
        "emailVerification.verificationTokenExpires": { $gt: new Date() },
      });

      if (!user) {
        return { failure: "Invalid or expired token" };
      }

      // Marquer l'email comme vérifié
      user.emailVerification = {
        isVerified: true,
        verifiedAt: new Date(),
        verificationToken: null,
        verificationTokenExpires: null,
      };

      await user.save();

      return { success: true, message: "Email verified successfully" };
    } catch (error) {
      console.error("Error verifying email token:", error);
      return { failure: "Error verifying email", error: error.message };
    }
  },
});

export const getLoginSessionHistory = useServerAction({
  role: ["USER"], // Rôles requis
  action: async (_, session) => {
    try {
      // Connexion à la base de données
      await dbConnect();

      // Récupérer les sessions associées à cet utilisateur
      const sessions = await Session.find({ userId: session._id })
        .sort({
          createdAt: -1,
        })
        .limit(10);

      // Si aucune session n'est trouvée
      if (!sessions || sessions.length === 0) {
        return { success: true, message: "No sessions found", sessions: [] };
      }

      // Retourner les sessions
      return {
        success: true,
        message: "Sessions retrieved successfully",
        sessions: JSON.parse(JSON.stringify(sessions)),
      };
    } catch (error) {
      console.error("Error retrieving login session history:", error);
      return {
        failure: true,
        message: "Error retrieving session history",
        error: error.message,
      };
    }
  },
});

export const searchUsers = useServerAction({
  role: ["ADMIN"],
  schema: z.object({
    searchTerm: z.string().optional(),
    limit: z.number().min(1).max(100).optional().default(20), // Limite entre 1 et 100
    skip: z.number().min(0).optional().default(0), // Pagination
  }),
  action: async ({
    searchTerm,
    limit = 20,
    skip = 0,
  }: {
    searchTerm?: string;
    limit?: number;
    skip?: number;
  }) => {
    try {
      await dbConnect();

      // Construction de l'objet de requête
      const queryObj: any = {};

      if (searchTerm) {
        queryObj["$or"] = [
          { name: { $regex: searchTerm, $options: "i" } },
          { email: { $regex: searchTerm, $options: "i" } },
        ];
      }

      // Compte le nombre total d'utilisateurs correspondant à la requête
      const totalUsers = await User.countDocuments(queryObj);

      // Récupère les utilisateurs avec la pagination
      const users = await User.find(queryObj)
        .select(
          "name email emailVerification.isVerified image isAdmin createdAt"
        ) // Exclure les champs sensibles
        .limit(limit)
        .skip(skip)
        .lean();

      return {
        users: JSON.parse(JSON.stringify(users)),
        totalUsers,
      };
    } catch (error) {
      console.error("Error fetching users:", error);
      return {
        users: [],
        totalUsers: 0,
      };
    }
  },
});