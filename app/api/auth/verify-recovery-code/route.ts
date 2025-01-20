import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import dbConnect from "@/libs/database/mongoose/mongooseConnect";
import User from "@/libs/database/mongoose/models/user/user";

export async function POST(req: NextRequest) {
  try {
    const { email, code } = await req.json();

    await dbConnect();

    // Vérifier si l'utilisateur existe et récupérer uniquement les champs nécessaires
    const user = await User.findOne({ email }).select(
      "passwordResetToken passwordResetExpires"
    );

    if (
      !user ||
      !user.passwordResetToken ||
      user.passwordResetExpires < Date.now()
    ) {
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

    return NextResponse.json({
      success: true,
      message: "Code vérifié avec succès",
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Erreur lors de la vérification du code" },
      { status: 500 }
    );
  }
}
