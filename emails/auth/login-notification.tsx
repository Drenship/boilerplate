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

interface LoginNotificationEmailProps {
  url?: string;
}

export const LoginNotificationEmail = ({ url }: LoginNotificationEmailProps) => (
  <Tailwind>
    <Html>
      <Head />
      <Preview>Your login code for Linear</Preview>
      <Body className="bg-white font-sans">
        <Container className="mx-auto py-5 px-0 max-w-3xl">
          <Img
            src={LOGO_URL}
            width="64"
            height="64"
            alt="Linear"
            className="rounded-full w-16 h-16"
          />
          <Heading className="text-2xl font-normal leading-tight tracking-tight text-gray-700 pt-4">
            Reset your password
          </Heading>
          <Text className="m-0 mb-4 text-sm leading-6 text-gray-700">
            This link will only be valid for the next 5 minutes.
          </Text>
          <Section className="py-6">
            <Button
              className="bg-blue-600 rounded font-semibold text-white text-base text-center block py-2.5 px-6"
              href={url}
            >
              Reset my password
            </Button>
          </Section>

          <Hr className="border-gray-300 my-10" />
          <Link href="https://linear.app" className="text-sm text-gray-500">
            Linear
          </Link>
        </Container>
      </Body>
    </Html>
  </Tailwind>
);

export default LoginNotificationEmail;