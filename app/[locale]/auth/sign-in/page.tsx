import PageAuthLayout from "@/components/ui/layout/AuthLayout";
import LoginForm from "@/components/ui/auth-form/LoginForm";
import { locales } from "@/config";
import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { generateGenericMetadata } from "@/libs/metadata";

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

    // Générer des métadonnées spécifiques pour une recherche ou une catégorie
    return await generateGenericMetadata({
      locale: lang,
      slug: "",
      type: "static",
      titleOverride: translations("auth.sign-in", {
        defaultValue: "Conenction",
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

export default async function SignInPage({
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
    <PageAuthLayout title={t("auth.sign-in")}>
      <LoginForm />
    </PageAuthLayout>
  );
}
