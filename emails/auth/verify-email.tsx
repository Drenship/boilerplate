import { LOGO_URL } from "@/libs/constantes";
import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Tailwind,
  Text,
} from "@react-email/components";
import * as React from "react";

interface EmailVerificationProps {
  title?: string;
  verificationLink?: string;
}

export const EmailVerification = ({
  title,
  verificationLink,
}: EmailVerificationProps) => (
  <Tailwind>
    <Html>
      <Head />
      <Preview>{title ? title : "Verify your email address"}</Preview>
      <Body className="bg-white font-sans">
        <Container className="mx-auto py-5 px-0 max-w-3xl">
          <Img
            src={LOGO_URL}
            width="64"
            height="64"
            alt="Logo"
            className="rounded-full w-16 h-16"
          />
          <Heading className="text-2xl font-normal leading-tight tracking-tight text-gray-700 pt-4">
            {title}
          </Heading>

          <Text className="m-0 mb-4 text-sm leading-6 text-gray-700">
            To complete your registration, please verify your email address by
            clicking the link below. This link will expire in the next 15 minutes.
          </Text>

          <Link
            href={verificationLink}
            className="inline-block px-4 py-2 mt-4 bg-blue-600 text-white font-semibold text-sm rounded-md hover:bg-blue-700"
            target="_blank"
            rel="noopener noreferrer"
          >
            Verify Email Address
          </Link>

          <Text className="m-0 mt-6 text-sm leading-6 text-gray-500">
            If you did not request this, please ignore this email.
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

EmailVerification.PreviewProps = {
  title: "Verify your email address",
  verificationLink: "https://www.adessya.com/api/user/email/verify?token=example-token",
} as EmailVerificationProps;

export default EmailVerification;