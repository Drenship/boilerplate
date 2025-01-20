import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import dbConnect from "@/libs/database/mongoose/mongooseConnect";
import User from "@/libs/database/mongoose/models/user/user";
import { auth } from "@/libs/auth/auth";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || !session._id) {
      return { failure: "not authenticated" };
    }

    const { currentPassword, newPassword, confirmPassword } = await req.json();

    if (newPassword !== confirmPassword) {
      return NextResponse.json(
        { message: "Les nouveaux mots de passe ne correspondent pas" },
        { status: 400 }
      );
    }

    await dbConnect();

    // Vérifier si l'utilisateur existe et récupérer uniquement les champs nécessaires
    const user = await User.findOne({ _id: session._id }).select("password");

    if (!user) {
      return NextResponse.json(
        { message: "Utilisateur non trouvé" },
        { status: 404 }
      );
    }

    // Vérifier si l'ancien mot de passe est correct
    const isCurrentPasswordCorrect = await bcrypt.compare(
      currentPassword,
      user.password
    );
    if (!isCurrentPasswordCorrect) {
      return NextResponse.json(
        { message: "L'ancien mot de passe est incorrect" },
        { status: 400 }
      );
    }

    // Hacher le nouveau mot de passe
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Mettre à jour le mot de passe
    user.password = hashedPassword;
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
