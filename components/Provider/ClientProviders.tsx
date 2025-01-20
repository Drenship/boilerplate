"use client";

import { ReactNode } from "react";
import { SessionProvider } from "next-auth/react";
import { NextIntlClientProvider } from "next-intl";
import { Toaster } from "react-hot-toast";
import { CheckCircle, XCircle } from "lucide-react";

type ClientProvidersProps = {
  children: ReactNode;
  locale: string;
  messages: Record<string, string>;
};

export default function ClientProviders({
  children,
  locale,
  messages,
}: ClientProvidersProps) {
  const browserTimeZone =
    typeof window !== "undefined" &&
    Intl.DateTimeFormat().resolvedOptions().timeZone;
  return (
    <SessionProvider>
      <NextIntlClientProvider
        locale={locale}
        timeZone={browserTimeZone || "UTC"}
        messages={messages}
      >
        <Toaster
          position="bottom-right"
          reverseOrder={false}
          gutter={8}
          toastOptions={{
            duration: 4000,
            style: {
              background: "#1E1E2F",
              color: "#F5F5F5",
              fontSize: "14px",
              borderRadius: "8px",
              boxShadow: "0 4px 10px rgba(0, 0, 0, 0.2)",
            },
            success: {
              duration: 3000,
              style: {
                background: "#4CAF50",
                color: "#FFFFFF",
                borderRadius: "8px",
                boxShadow: "0 4px 10px rgba(0, 0, 0, 0.2)",
              },
              icon: <CheckCircle color="#FFFFFF" size={20} />,
            },
            error: {
              duration: 5000,
              style: {
                background: "#F44336",
                color: "#FFFFFF",
                borderRadius: "8px",
                boxShadow: "0 4px 10px rgba(0, 0, 0, 0.2)",
              },
              icon: <XCircle color="#FFFFFF" size={20} />,
            },
          }}
        />
        {children}
      </NextIntlClientProvider>
    </SessionProvider>
  );
}
