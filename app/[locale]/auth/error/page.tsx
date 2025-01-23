"use client";

import { useSearchParams } from "next/navigation";
import { AlertCircle, ArrowLeft, ShieldX } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";

const errorMessages: { [key: string]: string } = {
  Configuration: "There is a problem with the server configuration.",
  AccessDenied: "You do not have permission to sign in.",
  Verification: "The verification link has expired or has already been used.",
  Default: "An unexpected authentication error occurred.",
};

export default function AuthError() {
  const t = useTranslations("Auth");
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  const errorMessage = error
    ? t(`serverConfigurationIssue`)
    : t("defaultError");

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg">
        <div className="flex flex-col items-center space-y-4">
          <div className="p-3 bg-red-100 rounded-full">
            <ShieldX className="h-12 w-12 text-red-600" aria-hidden="true" />
          </div>

          <h1 className="text-2xl font-bold text-gray-900">
            {t("authenticationError")}
          </h1>

          <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-4 rounded-lg w-full">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <p className="text-sm">{errorMessage}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="text-sm text-gray-600">
            <p>{t("suggestionTitle")}</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>{t("suggestions.checkInternet")}</li>
              <li>{t("suggestions.clearCookies")}</li>
              <li>{t("suggestions.signInAgain")}</li>
              <li>{t("suggestions.contactSupport")}</li>
            </ul>
          </div>

          <div className="pt-4 border-t border-gray-200">
            <Link
              href="/auth/sign-in"
              className="flex items-center justify-center space-x-2 w-full bg-black text-white py-2.5 px-4 rounded-lg hover:bg-gray-800 transition duration-200"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="text-inherit">{t("backToSignIn")}</span>
            </Link>

            <Link
              href="/"
              className="flex items-center justify-center space-x-2 w-full mt-3 text-gray-600 hover:text-gray-800 transition duration-200"
            >
              <span>{t("returnToHome")}</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}