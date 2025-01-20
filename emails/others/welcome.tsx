import { LOGO_URL } from "@/libs/constantes";
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";
import * as React from "react";

interface WelcomeEmailProps {
  userName?: string;
  dashboardUrl?: string;
}

export const WelcomeEmail = ({
  userName = "there",
  dashboardUrl = "https://www.adessya.com/account"
}: WelcomeEmailProps) => (
  <Tailwind>
    <Html>
      <Head />
      <Preview>Welcome to Adessya!</Preview>
      <Body className="bg-white font-sans">
        <Container className="mx-auto py-5 px-0 max-w-3xl">
          <Img
            src={LOGO_URL}
            width="64"
            height="64"
            alt="Adessya"
            className="rounded-full w-16 h-16"
          />
          <Heading className="text-2xl font-normal leading-tight tracking-tight text-gray-700 pt-4">
            Welcome to Adessya, {userName}!
          </Heading>
          <Text className="m-0 mb-4 text-sm leading-6 text-gray-700">
            We’re thrilled to have you here! Get ready to dive into your
            dashboard and explore all the features Adessya has to offer.
          </Text>
          <Section className="py-6">
            <Button
              className="bg-blue-600 rounded font-semibold text-white text-base text-center block py-2.5 px-6"
              href={dashboardUrl}
            >
              Go to Account
            </Button>
          </Section>
          <Text className="m-0 mt-4 text-sm leading-6 text-gray-700">
            If you have any questions or need assistance, feel free to reach out
            to our support team at any time.
          </Text>

          <Hr className="border-gray-300 my-10" />
          <Link
            href="https://www.adessya.com/"
            className="text-sm text-gray-500"
          >
            Adessya
          </Link>
        </Container>
      </Body>
    </Html>
  </Tailwind>
);

WelcomeEmail.PreviewProps = {
  userName: "John",
  dashboardUrl: "https://www.adessya.com/account",
} as WelcomeEmailProps;

export default WelcomeEmail;