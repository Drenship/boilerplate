import { locales } from "@/config";
import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { generateGenericMetadata } from "@/libs/metadata";
import PageAuthLayout from "@/components/ui/layout/AuthLayout";
import PasswordRecoveryProcess from "@/components/ui/auth-form/PasswordRecoveryProcess";

export const revalidate = 60; // Revalide toutes les 60 secondes
export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: {
    locale: string;
  };
}): Promise<Metadata> {
  try {
    const { locale } = await params;
    const lang = locale || "en";
    const translations = await getTranslations({
      locale: lang,
      namespace: "Metadata",
    });

    return await generateGenericMetadata({
      locale: lang,
      slug: "",
      type: "static",
      titleOverride: translations("auth.recovery", {
        defaultValue: "Récupération de compte",
      }),
      translations,
    });
  } catch (error) {
    console.error("Error generating metadata:", error);
    return {
      title: "Error",
      description: "There was an error generating metadata",
    };
  }
}

export default async function RecoveryPage({
  params,
}: {
  params: {
    locale: string;
  };
}) {
  const { locale } = await params;
  const lang = locale || "en";
  const t = await getTranslations({
    locale: lang,
    namespace: "Navigation",
  });

  return (
    <PageAuthLayout title={t("auth.recovery")}>
      <PasswordRecoveryProcess />
    </PageAuthLayout>
  );
}
