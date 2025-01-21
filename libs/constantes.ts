export const LOGO_URL =
  "https://www.adessya.com/logo/logo-adessya-fullname.png";
export const invoice_logo =
  "https://www.adessya.com/logo/logo-adessya-fullname.png";
export const USER_DEFAULT_PP =
  "https://static.vecteezy.com/ti/vecteur-libre/p3/1840612-image-profil-icon-male-icon-human-or-people-sign-and-symbol-vector-gratuit-vectoriel.jpg";

export const square_logo = "https://www.adessya.com/logo/logo-adessya-a.png";
// Définir les règles de vérification du mot de passe
export const PASSWORD_RULES = {
  minLength: 8,
  maxLength: 128,
  minUpperCase: 1,
  minLowerCase: 1,
  minNumbers: 1,
  minSpecialChars: 1,
};

// Définir les règles de vérification du téléphone
export const PHONE_RULES = {
  format:
    /^(\+|00)?((3[0-46-9]\d{8,11})|(4[013-9]\d{8,11})|(5[1-8]\d{8,11})|(6[0-6]\d{8,11})|(7[1-79]\d{8,11})|(8[124-9]\d{8,11})|(9[0-58]\d{8,11}))$/,
  minLength: 10,
  maxLength: 15,
};
