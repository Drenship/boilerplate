import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  Image,
  renderToBuffer,
} from "@react-pdf/renderer";
import { createTw } from "react-pdf-tailwind";
import { invoice_logo } from "@/libs/constantes";
import { OrderType } from "@/libs/typings";
import { localesType } from "@/config";

const tw = createTw({
  theme: {
    fontSize: {
      xss: ["10pt", { lineHeight: "12pt" }],
      xs: ["12pt", { lineHeight: "14pt" }],
      sm: ["14pt", { lineHeight: "16pt" }],
      base: ["16pt", { lineHeight: "18pt" }],
      lg: ["18pt", { lineHeight: "20pt" }],
      xl: ["20pt", { lineHeight: "22pt" }],
      "2xl": ["24pt", { lineHeight: "26pt" }],
      "3xl": ["30pt", { lineHeight: "32pt" }],
    },
    fontFamily: {
      sans: ["Helvetica", "sans-serif"],
    },
    extend: {
      colors: {
        customBlue: "#007BFF",
        customGray: "#F3F4F6",
      },
    },
  },
  defaultUnit: "pt",
});

const Invoice = ({ order, lang }: { order: OrderType; lang?: localesType }) => {
  const currencySymbols: Record<string, string> = {
    eur: "€",
    usd: "$",
    gbp: "£",
    cad: "C$",
    jpy: "¥",
  };

  const formatPrice = (
    price: number,
    currency: "eur" | "usd" | "gbp" | "cad" | "jpy"
  ) => {
    const symbol = currencySymbols[currency] || "$";
    return currency === "eur" || currency === "cad" || currency === "jpy"
      ? `${price} ${symbol}`
      : `${symbol}${price}`;
  };

  // Handle both Mongoose Document and plain object
  const orderFix = order?._doc || order || {};

  const company = {
    name: "Adessya",
    address: {
      street: "123 Rue Principale",
      postalCode: "75000",
      city: "Paris",
      country: "France",
      fullAddress: "123 Rue Principale, 75000 Paris, France",
    },
    phone: "06.23.45.67.89",
    email: "adessya-support@gmail.com",
    siret: "123 456 789 00010",
    vatNumber: "FR12345678901",
    legalForm: "SARL",
  };

  const orderData = {
    company,
    ...orderFix,
    paymentTerms: "Paiement sécurisé en ligne via Stripe",
  };

  console.log("orderData -> ", orderData);

  const defaultText = "N/A";

  return (
    <Document>
      <Page size="A4" style={tw("p-6 font-sans text-xs")}>
        {/* En-tête */}
        <View style={tw("flex-row justify-between items-start mb-6")}>
          {/* Logo et informations de l'entreprise */}
          <View style={tw("flex flex-col gap-2")}>
            <Image src={invoice_logo} style={tw("w-[140px] object-cover")}/>
            <View>
              <Text style={tw("text-xs")}>
                {orderData?.company?.address?.fullAddress || defaultText}
              </Text>
              <Text style={tw("text-xs")}>
                {orderData?.company?.email || defaultText}
              </Text>
              <Text style={tw("text-xs")}>
                {orderData?.company?.phone || defaultText}
              </Text>
            </View>
          </View>

          {/* Facture - Informations générales */}
          <View style={tw("flex flex-col gap-2")}>
            <View style={tw("flex flex-col gap-2 text-right")}>
              <View style={tw("text-lg font-bold uppercase")}>
                <Text>Facture</Text>
              </View>
              <Text style={tw("text-xs")}>
                Numéro de facture : {orderData?.invoiceId || defaultText}
              </Text>
              <Text style={tw("text-xs")}>
                Date de facturation :{" "}
                {orderData?.createdAt
                  ? new Date(orderData.createdAt).toLocaleDateString()
                  : defaultText}
              </Text>
              <Text style={tw("text-xs")}>
                Échéance :{" "}
                {orderData?.paidAt
                  ? new Date(orderData.paidAt).toLocaleDateString()
                  : defaultText}
              </Text>
            </View>

            {/* Informations client */}
            <View style={tw("mt-[32px]")}>
              <Text style={tw("text-sm font-bold")}>
                {orderData?.user?.address?.name || "Client inconnu"}
              </Text>
              <Text style={tw("text-xs")}>
                {orderData?.user?.address?.street || defaultText}
              </Text>
              <Text style={tw("text-xs")}>
                {orderData?.user?.address?.zipCode || defaultText},{" "}
                {orderData?.user?.address?.city || defaultText}
              </Text>
              <Text style={tw("text-xs")}>
                {orderData?.user?.address?.country || defaultText}
              </Text>
            </View>
          </View>
        </View>

        {/* Tableau des articles */}
        <View style={tw("mb-6")}>
          <View
            style={tw(
              "flex flex-row bg-sky-950 text-white py-2 px-4 rounded-lg"
            )}
          >
            <Text style={tw("w-1/2 font-bold")}>Description</Text>
            <Text style={tw("w-1/6 text-center font-bold")}>Quantité</Text>
            <Text style={tw("w-1/6 text-center font-bold")}>Prix Unit. HT</Text>
            <Text style={tw("w-1/6 text-right font-bold")}>Total</Text>
          </View>

          {orderData?.items?.length > 0 ? (
            orderData.items.map((item, index) => (
              <View
                key={index}
                style={tw("flex flex-row border-b border-gray-200 p-4")}
              >
                <Text style={tw("w-1/2")}>{item.name || defaultText}</Text>
                <Text style={tw("w-1/6 text-center")}>
                  {item.quantity || "0"}
                </Text>
                <Text style={tw("w-1/6 text-center")}>
                  {item.priceHT
                    ? formatPrice(Number(item.priceHT), orderData.currency)
                    : defaultText}
                </Text>
                <Text style={tw("w-1/6 text-right")}>
                  {formatPrice(
                    Number(item.quantity * (item.price || 0)),
                    orderData.currency
                  )}
                </Text>
              </View>
            ))
          ) : (
            <Text style={tw("text-center text-gray-500 mt-4")}>
              Aucun article disponible
            </Text>
          )}
        </View>

        {/* Totaux */}
        <View style={tw("flex flex-col gap-2 text-right mb-6")}>
          <Text style={tw("text-sm")}>
            Sous-total :{" "}
            {formatPrice(Number(orderData?.subtotal || 0), orderData.currency)}
          </Text>
          {orderData.discount && (
            <Text style={tw("text-sm")}>
              Remise : -
              {formatPrice(Number(orderData.discount), orderData.currency)}
            </Text>
          )}
          <Text style={tw("text-sm")}>
            TVA ({orderData.taxRate || 20}%) :{" "}
            {formatPrice(Number(orderData?.taxPrice || 0), orderData.currency)}
          </Text>
          <Text style={tw("font-bold text-base")}>
            Total :{" "}
            {formatPrice(
              Number(orderData?.totalPrice || 0),
              orderData.currency
            )}
          </Text>
        </View>

        {/* Bas de page */}
        <View style={tw("mt-auto")}>
          <Text style={tw("text-center")}>
            Merci pour votre confiance ! Si vous avez des questions, veuillez
            nous contacter.
          </Text>
          <Text
            style={tw("border-t border-gray-200 mt-4 pt-4 text-xs text-center")}
          >
            {orderData?.company?.name}, {orderData?.company?.legalForm}, SIRET{" "}
            {orderData?.company?.siret}, TVA {orderData?.company?.vatNumber}.
          </Text>
        </View>
      </Page>
    </Document>
  );
};

export const bufferInvoice = async (order: OrderType) => {
  console.log("bufferInvoice", order);
  if (!order || typeof order !== "object") {
    throw new Error("Order data is invalid");
  }
  return await renderToBuffer(<Invoice order={order} />);
};

export default Invoice;