"use client";

import React, { ReactNode, useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { persistQueryClient } from "@tanstack/react-query-persist-client";
import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";
import { SessionProvider } from "next-auth/react";
import { NextIntlClientProvider } from "next-intl";
import { Toaster } from "react-hot-toast";
import { CheckCircle, XCircle } from "lucide-react";
import { ThemeProvider } from "next-themes";

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

  const [queryClient, setQueryClient] = useState<QueryClient | null>(null);

  useEffect(() => {
    // Vérification que le code s'exécute côté client
    if (typeof window !== "undefined") {
      const localStoragePersister = createSyncStoragePersister({
        storage: window.localStorage,
      });

      const client = new QueryClient({
        defaultOptions: {
          queries: {
            // Données considérées comme fraîches pendant 10 minutes
            staleTime: 1000 * 60 * 10,
            // Cache disponible pendant 10 minutes après la récupération
            cacheTime: 1000 * 60 * 10,
          },
        },
      });

      // Persister le cache dans localStorage
      persistQueryClient({
        queryClient: client,
        persister: localStoragePersister,
      });

      // Initialisation du QueryClient uniquement côté client
      setQueryClient(client);
    }
  }, []);

  // Retourner un loader pendant l'initialisation du QueryClient
  if (!queryClient) {
    return <p>loading...</p>;
  }
  return (
    <SessionProvider>
      <ThemeProvider attribute="data-theme" defaultTheme="system">
        <QueryClientProvider client={queryClient}>
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
        </QueryClientProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}
