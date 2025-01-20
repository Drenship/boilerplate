import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import dbConnect from "@/libs/database/mongoose/mongooseConnect";
import User from "@/libs/database/mongoose/models/user/user";

export async function POST(req: NextRequest) {
  try {
    const { email, newPassword, confirmPassword, code } = await req.json();

    if (newPassword !== confirmPassword) {
      return NextResponse.json(
        { message: "Les mots de passe ne correspondent pas" },
        { status: 400 }
      );
    }

    await dbConnect();

    // Vérifier si l'utilisateur existe et récupérer uniquement les champs nécessaires
    const user = await User.findOne({ email }).select(
      "password passwordResetToken passwordResetExpires"
    );

    if (!user) {
      return NextResponse.json(
        { message: "Utilisateur non trouvé" },
        { status: 404 }
      );
    }

    // Vérifier si le code de récupération est valide et n'a pas expiré
    if (!user.passwordResetToken || user.passwordResetExpires < Date.now()) {
      return NextResponse.json(
        { message: "Code invalide ou expiré" },
        { status: 400 }
      );
    }

    // Supprimer les tirets du code
    const sanitizedCode = code.replace(/-/g, "");

    // Comparer le code de récupération avec le token haché
    const isMatch = await bcrypt.compare(sanitizedCode, user.passwordResetToken);
    if (!isMatch) {
      return NextResponse.json({ message: "Code incorrect" }, { status: 400 });
    }

    // Hacher le nouveau mot de passe
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    user.password = hashedPassword;

    // Réinitialiser le token de récupération
    user.passwordResetToken = null;
    user.passwordResetExpires = null;
    await user.save();

    return NextResponse.json({
      success: true,
      message: "Mot de passe mis à jour avec succès",
    });
  } catch (error) {
    return NextResponse.json(
      { message: "Erreur lors de la mise à jour du mot de passe" },
      { status: 500 }
    );
  }
}