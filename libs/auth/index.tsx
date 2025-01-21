import crypto from "crypto";
import bcrypt from "bcrypt";

// Fonction pour générer et hacher le code de récupération
export async function generatePasswordResetToken() {
  // Générer un code de récupération aléatoire de 8 caractères
  const resetCode = crypto.randomBytes(4).toString("hex").toUpperCase();

  // Ajouter des tirets tous les 4 caractères
  const formattedCode = resetCode.match(/.{1,4}/g)?.join("-");

  // Hacher le code de récupération avant de le stocker
  const hashedToken = await bcrypt.hash(resetCode, 12);

  return { resetCode: formattedCode, hashedToken };
}

