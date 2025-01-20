import { NextRequest, NextResponse } from "next/server";
import { resetPasswordEmail } from "@/libs/config/resend.config";
import { generatePasswordResetToken } from "@/libs/auth";
import dbConnect from "@/libs/database/mongoose/mongooseConnect";
import User from "@/libs/database/mongoose/models/user/user";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    await dbConnect();

    // Récupérer uniquement les champs nécessaires
    const user = await User.findOne({ email }).select(
      "passwordResetToken passwordResetExpires passwordResetRequestTimestamp email"
    );

    if (!user) {
      return NextResponse.json(
        { message: "Utilisateur non trouvé" },
        { status: 404 }
      );
    }

    // Définir un délai de 1 minute entre les envois de mail
    const timeLimit = 60 * 1000; // 1 minute
    const currentTime = Date.now();

    // Vérifier si l'utilisateur a déjà demandé un code récemment
    if (
      user.passwordResetRequestTimestamp &&
      currentTime - user.passwordResetRequestTimestamp < timeLimit
    ) {
      return NextResponse.json(
        {
          message:
            "Vous devez attendre 1 minute avant de demander un nouveau code",
        },
        { status: 429 } // Status code 429: Too Many Requests
      );
    }

    // Générer le token de récupération et hacher le code
    const { resetCode, hashedToken } = await generatePasswordResetToken();

    // Enregistrer le token haché, la date d'expiration et le timestamp de la demande
    user.passwordResetToken = hashedToken;
    user.passwordResetExpires = currentTime + 5 * 60 * 1000; // 5 minutes
    user.passwordResetRequestTimestamp = currentTime; // Timestamp de la demande
    await user.save();

    // Envoyer l'e-mail avec le code de récupération
    await resetPasswordEmail({
      to: email,
      subject: "Code - Réinitialisation du mot de passe",
      code: resetCode, // Envoyer le code non haché à l'utilisateur
    });

    return NextResponse.json({
      success: true,
      message: "Code de récupération envoyé",
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Erreur lors de l'envoi du code" },
      { status: 500 }
    );
  }
}