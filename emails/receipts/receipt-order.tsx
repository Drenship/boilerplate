import { LOGO_URL } from "@/libs/constantes";
import { OrderType } from "@/libs/typings";
import {
  Body,
  Container,
  Column,
  Head,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Row,
  Section,
  Text,
  Tailwind,
  Button,
} from "@react-email/components";
import * as React from "react";

const baseUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

interface ReceiptEmailPreviewProps {
  email: string;
  order: OrderType;
}

export const ReceiptEmail = ({ email, order }: ReceiptEmailPreviewProps) => {
  // Vérification que la commande et l'ID existent
  if (!order || !order._id) {
    console.error("Order or Order ID is undefined");
    return <Text>Error: Order data is missing.</Text>;
  }

  return (
    <Tailwind>
      <Html>
        <Head />
        <Preview>Receipt for your order</Preview>

        <Body className="bg-white font-sans">
          <Container className="mx-auto py-5 px-4 max-w-xl">
            <Section>
              <Row>
                <Column>
                  <Img
                    src={LOGO_URL}
                    height="42"
                    className="object-contain"
                    alt="Company Logo" // Ajout de l'attribut alt pour l'accessibilité
                  />
                </Column>
                <Column className="text-right">
                  <Text className="text-2xl font-light text-gray-600">
                    Receipt
                  </Text>
                </Column>
              </Row>
            </Section>
            <Section>
              <Text className="text-center my-9 text-sm font-medium text-black">
                Thank you for your order! We appreciate your business. If you
                have any questions or need further assistance,
                <Link
                  className="text-blue-600 underline px-1"
                  href={`${baseUrl}/en/contact`}
                >
                  contact us.
                </Link>
              </Text>
            </Section>
            <Section className="bg-gray-100 rounded-lg text-sm">
              <Row className="h-11">
                <Column className="pl-5 border-b border-r border-white">
                  <Text className="text-gray-600 text-xs">EMAIL:</Text>
                </Column>
                <Column className="pl-5 border-b border-r border-white">
                  <Text className="text-sm">{email}</Text>
                </Column>
              </Row>
              <Row className="h-11">
                <Column className="pl-5 border-b border-r border-white">
                  <Text className="text-gray-600 text-xs">INVOICE DATE:</Text>
                </Column>
                <Column className="pl-5 border-b border-r border-white">
                  <Text className="text-sm">
                    {order?.createdAt
                      ? new Date(order.createdAt).toLocaleDateString()
                      : "N/A"}
                  </Text>
                </Column>
              </Row>
              <Row className="h-11">
                <Column className="pl-5 border-b border-r border-white">
                  <Text className="text-gray-600 text-xs">Invoice ID:</Text>
                </Column>
                <Column className="pl-5 border-b border-r border-white">
                  <Text className="text-sm">{order?.invoiceId}</Text>
                </Column>
              </Row>
            </Section>
            <Section className="bg-gray-100 rounded-lg my-8 h-6">
              <Text className="bg-gray-100 pl-2 text-sm font-medium">
                Products
              </Text>
            </Section>

            {/* Vérification des items avant de les afficher */}
            {order?.items?.length > 0 ? (
              order.items.map((item, index) => (
                <Section key={index} className="border-t">
                  <Row>
                    <Column className="w-16">
                      {item.image ? (
                        <Img
                          src={item.image}
                          width="64"
                          height="64"
                          alt={item.name || "Product image"}
                          className="rounded-lg border border-gray-300 object-cover"
                        />
                      ) : (
                        <Text>No image available</Text>
                      )}
                    </Column>
                    <Column className="pl-6">
                      <Text className="text-sm font-semibold">
                        {item.name || "N/A"}
                      </Text>
                    </Column>
                    <Column className="text-right pr-6">
                      <Text className="text-sm font-semibold">
                        {item.price
                          ? `${item.price} ${
                              order.currency?.toUpperCase() || "USD"
                            }`
                          : "Price not available"}
                      </Text>
                    </Column>
                  </Row>
                </Section>
              ))
            ) : (
              <Text>No items found</Text>
            )}

            <Hr className="my-8" />

            <Section className="text-right">
              <Row>
                <Column className="text-right pr-7">
                  <Text className="text-xs text-gray-600 font-semibold">
                    TOTAL
                  </Text>
                </Column>
                <Column className="border-l border-gray-300 h-12"></Column>
                <Column className="text-right pr-7">
                  <Text className="text-lg font-semibold">
                    {order.totalPrice} {order.currency?.toUpperCase() || "USD"}
                  </Text>
                </Column>
              </Row>
            </Section>

            {/* Lien pour voir la commande, désactivé si l'ID est absent */}
            <Button
              className="bg-blue-600 rounded font-semibold text-white text-base text-center block py-2.5 px-6 my-10"
              href={
                order?._id
                  ? `${baseUrl}/en/account/billing-history?id=${order._id.toString()}`
                  : undefined
              }
              disabled={!order?._id}
            >
              See my order
            </Button>

            <Hr className="my-20" />
          </Container>
        </Body>
      </Html>
    </Tailwind>
  );
};

export default ReceiptEmail;