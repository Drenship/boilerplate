"use server";

import dbConnect from "@/libs/database/mongoose/mongooseConnect";
import User from "@/libs/database/mongoose/models/user/user";
import { auth } from "@/libs/auth/auth";
import { stripe } from "@/libs/config/stripe.config";
import { CurrencyType, PlanDurationType, TypeProduct } from "@/libs/typings";
import Stripe from "stripe";

// Fonction pour créer un compte Stripe
export async function createStripeAccount(email: string) {
  const account = await stripe.accounts.create({
    email: email,
    controller: {
      losses: {
        payments: "application",
      },
      fees: {
        payer: "application",
      },
      stripe_dashboard: {
        type: "express",
      },
    },
  });

  return account;
}

export async function checkStripeAccount(accountId: string) {
  try {
    const account = await stripe.accounts.retrieve(accountId);

    // Vérifiez l'état du compte
    if (account.details_submitted && account.charges_enabled) {
      return {
        isConnected: true,
        accountStatus: "Account is fully connected and active",
      };
    } else {
      return {
        isConnected: false,
        accountStatus: "Account is not fully connected or active",
        account: account,
      };
    }
  } catch (error) {
    console.error("Error fetching Stripe account:", error);
    return {
      isConnected: false,
      accountStatus: "Error fetching account details",
      error,
    };
  }
}

// Fonction pour mettre à jour un compte Stripe dans MongoDB
export async function updateStripeAccount(accountId: string) {
  return;
}

// Fonction pour créer un lien d'onboarding pour Stripe
export async function createAccountLink({
  accountId,
  email,
}: {
  accountId?: string | null;
  email: string;
}) {
  let account;
  try {
    const session = await auth();
    if (!session || !session.user) {
      return { failure: "not authenticated" };
    }
    // Si un accountId est fourni, on récupère le compte existant
    if (accountId) {
      account = await stripe.accounts.retrieve(accountId);
    }
    // Sinon, on crée un nouveau compte en utilisant l'email
    else if (email) {
      account = await createStripeAccount(email);

      await dbConnect();
      let user = await User.findById(session._id);
      if (user) {
        user.integrations.stripe = {
          accountId: account.id,
          isAssociate: false,
        };
        await user.save();
      }
    } else {
      throw new Error("Account ID or email is required to create a link");
    }
    // Créez un lien d'onboarding pour le compte Stripe
    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: `${process.env.BASE_URL}/hub/integration`, // URL de redirection en cas d'échec
      return_url: `${process.env.BASE_URL}/hub/integration?success`, // URL de redirection après succès
      //return_url: `${process.env.BASE_URL}/api/integrations/stripe-hub/${account.id}`, // URL de redirection après succès
      type: "account_onboarding",
    });

    console.log(
      `${process.env.BASE_URL}/api/integrations/stripe-hub/${account.id}`
    );

    return { url: accountLink.url };
  } catch (error) {
    return { error: error };
  }
}

// créer un lien pour aller sur le dashbord
export async function createDashboardLink(accountId: string) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return { failure: "not authenticated" };
    }

    const link = await stripe.accounts.createLoginLink(accountId);
    return { url: link.url }; // Retourne l'URL du lien
  } catch (error) {
    console.error("Error creating dashboard link:", error);

    return {
      failure: "Erreur lors de la création du lien vers le tableau de bord.",
    };
  }
}

// create Checkout Session for Subscription & Payment
export async function createCheckoutSession({
  product,
  devise,
  price,
  resultPaidOrder,
  mode, // "payment" ou "subscription"
  freeTrial,
  duration,
  sellerId,
}: {
  product: TypeProduct;
  devise: CurrencyType;
  price: number;
  resultPaidOrder: any;
  mode: "payment" | "subscription"; // Mode de la session (paiement ou abonnement)
  duration: "lifetime" | PlanDurationType;
  freeTrial?: {
    trial: boolean;
    duration: number;
  };
  sellerId: string;
}) {
  try {
    console.log("sellerId -> ", sellerId);
    const session = await auth();
    if (!session || !session.user) {
      return { failure: "not authenticated" };
    }

    const selectImage = (images) => {
      // Exemple : Prioriser par type 'card', sinon prendre le premier
      const preferredType = "card";
      const preferredImage = images.find((img) => img.name === preferredType);

      return preferredImage ? preferredImage.url : images[0]?.url || ""; // Retourne une URL valide ou une chaîne vide
    };

    // Récupère l'image dans previews[0]
    const firstImageUrl =
      Array.isArray(product.previews) && Array.isArray(product.previews[0])
        ? selectImage(product.previews[0]) // Appelle la fonction pour choisir l'image
        : "";

    const sessionConfig: any = {
      mode: mode, // Définit si c'est un paiement ou un abonnement
      line_items: [
        {
          price_data: {
            currency: devise || "eur",
            unit_amount: Math.round((price as number) * 100), // Prix en centimes
            product_data: {
              name: product.title,
              description:
                product.description && product.description.length > 200
                  ? product.description.substring(0, 200) + "..."
                  : product.description,
              images: [firstImageUrl], // Images du produit
            },
          },
          quantity: 1, // Quantité par défaut
        },
      ],
      metadata: {
        userId: session._id,
        orderId: resultPaidOrder.order._id.toString(),
        sellerId: sellerId.toString(),
      },
      success_url: `${process.env.BASE_URL}/marketplace/${
        product.slug || product._id
      }?payment=success&orderId=${resultPaidOrder.order._id}`, // Redirection en cas de succès
      cancel_url: `${process.env.BASE_URL}/marketplace/${
        product.slug || product._id
      }`, // Redirection en cas d'annulation
    };

    // Ajouter des informations spécifiques à l'abonnement si nécessaire
    if (mode === "subscription") {
      if (freeTrial && freeTrial.trial === true) {
        sessionConfig.subscription_data = {
          trial_period_days: freeTrial.duration || 7, // Période d'essai gratuite
        };
      }

      const mappedInterval = mapInterval(duration);

      if (mappedInterval) {
        if (typeof mappedInterval === "object") {
          // Cas pour 3 ou 6 mois où on a besoin de `interval_count`
          sessionConfig.line_items[0].price_data.recurring = {
            interval: mappedInterval.interval,
            interval_count: mappedInterval.interval_count,
          };
        } else {
          // Cas pour un interval simple comme 'month' ou 'year'
          sessionConfig.line_items[0].price_data.recurring = {
            interval: mappedInterval,
          };
        }

        // Configurer les frais de plateforme et la destination du paiement
        sessionConfig.subscription_data = {
          ...sessionConfig.subscription_data,
          application_fee_percent: 30, // 30% de commission pour la plateforme
          transfer_data: {
            destination: product.author.integrations.stripe.accountId, // Compte Stripe du vendeur
          },
          metadata: {
            userId: session._id,
            orderId: resultPaidOrder.order._id.toString(),
            sellerId: sellerId.toString(),
          },
        };
      }
    }

    // Ajouter `payment_intent_data` seulement si c'est un paiement unique
    if (mode === "payment") {
      sessionConfig.payment_intent_data = {
        application_fee_amount: Math.round((price as number) * 100 * 0.3), // Frais de la plateforme (ex: 30% des revenus)
        transfer_data: {
          destination: product.author.integrations.stripe.accountId as string, // Compte Stripe du vendeur
        },
      };
    }

    // Créer la session de checkout avec Stripe
    const checkoutSession = await stripe.checkout.sessions.create(
      sessionConfig
    );

    return checkoutSession;
  } catch (error) {
    console.error("Error creating checkout session:", error);
    throw new Error("Checkout session creation failed");
  }
}

function mapInterval(interval: string) {
  switch (interval) {
    case "sub-monthly":
      return "month";
    case "sub-three-monthly":
      return {
        interval: "month",
        interval_count: 3, // Tous les 3 mois
      };
    case "sub-six-monthly":
      return {
        interval: "month",
        interval_count: 6, // Tous les 6 mois
      };
    case "sub-yearly":
      return "year";
    case "lifetime":
      return null; // La gestion des paiements à vie est différente et peut ne pas nécessiter d'abonnement récurrent
    default:
      throw new Error(`Unknown interval: ${interval}`);
  }
}

// Annuler un paiement
export const cancelAndRefundPayment = async (
  paymentIntentId: string
): Promise<void> => {
  try {
    // Retrieve the PaymentIntent on the platform account
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (!paymentIntent) {
      throw new Error("PaymentIntent not found");
    }

    console.log("PaymentIntent -> :", paymentIntent);
    console.log("PaymentIntent Status:", paymentIntent.status);

    // If the PaymentIntent succeeded, use the charge ID to create a refund
    if (paymentIntent.status === "succeeded" && paymentIntent.latest_charge) {
      const chargeId = paymentIntent.latest_charge as string;

      // Create a refund for this charge on the platform account
      const refund = await stripe.refunds.create({
        charge: chargeId, // Use the charge ID
        refund_application_fee: true, // Refund the application fee
        reverse_transfer: true, // Reverse the transfer to the connected account
      });

      console.log("Refund successful:", refund);
    } else if (paymentIntent.status === "requires_capture") {
      // Cancel the PaymentIntent if it hasn't been captured yet
      await stripe.paymentIntents.cancel(paymentIntentId);
      console.log("PaymentIntent canceled successfully");
    } else {
      throw new Error("PaymentIntent cannot be canceled or refunded");
    }
  } catch (error: any) {
    console.error("Error during canceling or refunding:", error.message);
    throw new Error(`Failed to cancel or refund payment: ${error.message}`);
  }
};

// Corrected method to cancel a subscription a la fin de la periode
export const cancelSubscription = async (subscriptionId: string) => {
  try {
    const canceledSubscription = await stripe.subscriptions.update(
      subscriptionId,
      {
        cancel_at_period_end: true, // This cancels the subscription at the end of the current period
      }
    );
    return canceledSubscription;
  } catch (error: any) {
    console.error(`Failed to cancel subscription: ${error.message}`);
    throw new Error("Unable to cancel the subscription.");
  }
};

export const cancelSubscriptionImmediatelyWithRefund = async (
  subscriptionId: string
) => {
  try {
    // 1. Cancel the subscription immediately by setting cancel_at_period_end to false
    const canceledSubscription = await stripe.subscriptions.update(
      subscriptionId,
      {
        cancel_at_period_end: false, // Cancels immediately
      }
    );

    // 2. If the subscription is canceled, check if there's an invoice to refund
    const latestInvoiceId = canceledSubscription.latest_invoice;

    if (latestInvoiceId) {
      const invoice = await stripe.invoices.retrieve(latestInvoiceId);

      const paymentIntentId = invoice.payment_intent;

      // 3. Check if there's a valid payment intent for refund
      if (paymentIntentId) {
        const refund = await stripe.refunds.create({
          payment_intent: paymentIntentId,
          refund_application_fee: true,
          reverse_transfer: true,
        });
        console.log("Refund successful:", refund);
        return { success: true, refund };
      } else {
        console.log("No payment intent found for refund.");
        return { success: false, message: "No payment intent to refund." };
      }
    } else {
      console.log("No invoice found for the subscription.");
      return {
        success: false,
        message: "No invoice found to process refund.",
      };
    }
  } catch (error: any) {
    console.error(
      `Error during immediate cancellation and refund: ${error.message}`
    );
    throw new Error("Failed to cancel subscription and issue refund.");
  }
};

export const cancelSubscriptionAtPeriodEnd = async (subscriptionId: string) => {
  try {
    const canceledSubscription = await stripe.subscriptions.update(
      subscriptionId,
      {
        cancel_at_period_end: true,
      }
    );
    return canceledSubscription;
  } catch (error: any) {
    console.error(`Error during cancellation at period end: ${error.message}`);
    throw new Error("Unable to cancel at the end of the period.");
  }
};

//  Annuler le renouvellement automatique des subscriptions
export const cancelAutoRenewal = async (subscriptionId: string) => {
  try {
    const updatedSubscription = await stripe.subscriptions.update(
      subscriptionId,
      {
        cancel_at_period_end: true, // Cancel at the end of the current period
      }
    );
    return updatedSubscription;
  } catch (error: any) {
    console.error(`Failed to cancel auto-renewal: ${error.message}`);
    throw new Error("Unable to cancel auto-renewal.");
  }
};

export async function getAccountFinancials(accountId: string) {
  try {
    // 1. Retrieve the user's Stripe balance
    const balance = await stripe.balance.retrieve(
      {},
      { stripeAccount: accountId }
    );

    // 2. Get the start date of the week and month in UNIX timestamps
    const startOfWeek = Math.floor(
      new Date(
        new Date().setDate(new Date().getDate() - new Date().getDay())
      ).getTime() / 1000
    ); // Start of week
    const startOfMonth = Math.floor(
      new Date(new Date().setDate(1)).getTime() / 1000
    ); // Start of month

    // 3. Retrieve weekly balance transactions (with pagination)
    const weeklyTransactions = await fetchAllTransactions(
      { created: { gte: startOfWeek } },
      { stripeAccount: accountId }
    );

    // 4. Retrieve monthly balance transactions (with pagination)
    const monthlyTransactions = await fetchAllTransactions(
      { created: { gte: startOfMonth } },
      { stripeAccount: accountId }
    );

    // 5. Define transaction types to include in earnings
    const earningTypes = ["payment", "refund", "adjustment", "payment_refund"];

    // 6. Calculate weekly earnings and prepare data for weekly series
    const weeklyData = Array(7).fill(0); // Initialize a series for 7 days
    const weeklyEarn = weeklyTransactions.reduce((acc, transaction) => {
      // Include only relevant transaction types
      if (earningTypes.includes(transaction.type)) {
        const date = new Date(transaction.created * 1000).getDay(); // Get day of the week (0-6)
        const netAmount = transaction.net / 100; // Net amount in currency units

        // Add net amount to the correct date
        weeklyData[date] += netAmount;
        return acc + netAmount;
      }
      return acc;
    }, 0);

    // 7. Calculate monthly earnings and prepare data for monthly series
    const daysInMonth = new Date(
      new Date().getFullYear(),
      new Date().getMonth() + 1,
      0
    ).getDate();
    const monthlyData = Array(daysInMonth).fill(0); // Initialize a series for all days of the month
    const monthlyEarn = monthlyTransactions.reduce((acc, transaction) => {
      // Include only relevant transaction types
      if (earningTypes.includes(transaction.type)) {
        const day = new Date(transaction.created * 1000).getDate() - 1; // Get day of the month (0-based index)
        const netAmount = transaction.net / 100; // Net amount in currency units

        // Add net amount to the correct date
        monthlyData[day] += netAmount;
        return acc + netAmount;
      }
      return acc;
    }, 0);

    // Retrieve currency from balance or default to 'usd'
    const currency = balance.available[0]?.currency || "usd";

    // 8. Return the financial data
    return {
      balance: {
        available: balance.available.reduce(
          (acc, amount) => acc + amount.amount / 100,
          0
        ),
        pending: balance.pending.reduce(
          (acc, amount) => acc + amount.amount / 100,
          0
        ),
        currency,
      },
      weeklyEarn,
      monthlyEarn,
      weeklyData,
      monthlyData,
      currency,
    };
  } catch (error: any) {
    console.error(
      `Failed to retrieve financials for account ${accountId}:`,
      error
    );
    throw new Error(
      `Unable to fetch financial details for account ${accountId}`
    );
  }
}

// Helper function to handle pagination
async function fetchAllTransactions(
  params: Stripe.BalanceTransactionListParams,
  options: Stripe.RequestOptions
) {
  let transactions: Stripe.BalanceTransaction[] = [];
  let hasMore = true;
  let startingAfter: string | undefined = undefined;

  while (hasMore) {
    const response = await stripe.balanceTransactions.list(
      {
        ...params,
        limit: 100, // Maximum allowed by Stripe
        starting_after: startingAfter,
      },
      options // Pass stripeAccount in options
    );

    transactions = transactions.concat(response.data);
    hasMore = response.has_more;
    if (hasMore) {
      startingAfter = response.data[response.data.length - 1].id;
    }
  }

  return transactions;
}

// Server Action pour calculer les paiements par mois et renvoyer des données pour le graphique
export async function calculateMonthlyPayments({
  startDate,
  endDate,
  accountId,
}: {
  startDate: string;
  endDate: string;
  accountId: string;
}) {
  try {
    // Convert start and end dates to UNIX timestamps
    const startTimestamp = Math.floor(new Date(startDate).getTime() / 1000);
    const endTimestamp = Math.floor(new Date(endDate).getTime() / 1000);

    // Initialize an array for 12 months with amounts set to 0
    const monthlyData = Array(12).fill(0);

    // Fetch all balance transactions within the date range
    const balanceTransactions = await fetchAllTransactions(
      {
        created: {
          gte: startTimestamp,
          lte: endTimestamp,
        },
      },
      { stripeAccount: accountId }
    );

    // Define transaction types to include
    const earningTypes = ["payment", "refund", "adjustment", "payment_refund"];

    // Initialize currency
    let currency = "usd";

    // Process each transaction
    balanceTransactions.forEach((transaction) => {
      // Include only relevant transaction types
      if (earningTypes.includes(transaction.type)) {
        const transactionDate = new Date(transaction.created * 1000);
        const month = transactionDate.getMonth(); // 0 = January, 11 = December
        const netAmount = transaction.net / 100; // Convert amount to currency units

        // Set currency from the first transaction
        if (currency !== transaction.currency) {
          currency = transaction.currency;
        }

        // Add net amount to the corresponding month
        monthlyData[month] += netAmount;
      }
    });

    // Calculate the total amount
    const totalAmount = monthlyData.reduce((acc, amount) => acc + amount, 0);

    return { success: true, monthlyData, totalAmount, currency };
  } catch (error: any) {
    console.error("Error calculating monthly payments:", error);
    return { success: false, error: error.message };
  }
}
