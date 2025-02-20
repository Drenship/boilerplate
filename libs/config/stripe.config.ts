import Stripe from "stripe";

// Configurez Stripe avec votre clé secrète
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

if (!stripeSecretKey) {
  throw new Error("Stripe secret key is not defined");
}

export const stripe = new Stripe(stripeSecretKey, {
  apiVersion: "2024-06-20",
  typescript: true
});