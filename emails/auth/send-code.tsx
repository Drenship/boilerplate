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

interface SendCodeEmailProps {
  title?: string;
  validationCode?: string;
}

export const SendCodeEmail = ({
  title,
  validationCode,
}: SendCodeEmailProps) => (
  <Tailwind>
    <Html>
      <Head />
      <Preview>{title ? title : "This is your code"}</Preview>
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
            {title}
          </Heading>

          <Text className="m-0 mb-4 text-sm leading-6 text-gray-700">
            This code will only be valid for the next 5 minutes.
          </Text>
          <code className="font-mono font-bold px-1 bg-gray-300 text-lg rounded text-gray-700">
            {validationCode}
          </code>
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

SendCodeEmail.PreviewProps = {
  title: "Your 2fa login code",
  validationCode: "XYXY-XZXZ-X0X0",
} as SendCodeEmailProps;

export default SendCodeEmail;