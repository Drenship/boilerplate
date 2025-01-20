import { ReactNode } from "react";
import { getMessages, setRequestLocale } from "next-intl/server";
import { locales } from "@/config";
import ClientProviders from "@/components/Provider/ClientProviders";

type Props = {
  children: ReactNode;
  params: { locale: string };
};

// Generate static parameters for locales
export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

// Generate metadata for each language
export async function generateMetadata({ params }: Omit<Props, "children">) {
  const { locale } = await params;

  let title = "Mon app"; // Default title

  try {
    const messages = await getMessages({ locale, namespace: "LocaleLayout" });
    title = messages?.title || title;
  } catch (error) {
    console.error("Error fetching translations:", error);
  }

  return { title };
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;

  setRequestLocale(locale); // Ensure locale is set correctly

  const messages = await getMessages({ locale });

  return (
    <>
      {/* Set the language attribute using a dynamic effect */}
      <ClientProviders locale={locale} messages={messages}>
        {children}
      </ClientProviders>
    </>
  );
}
