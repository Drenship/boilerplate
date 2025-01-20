"server-only";
import { routing } from "./routing";
import { getRequestConfig } from "next-intl/server";
import { locales } from "@/config";

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;

  // Validate that the incoming `locale` parameter is valid
  if (!locale || !routing.locales.includes(locale as any)) {
    locale = routing.defaultLocale;
  }

  return {
    locale,
    messages: (
      await (locale === "en"
        ? // When using Turbopack, this will enable HMR for `en`
          import("@/i18n/translates/en.json")
        : import(`@/i18n/translates/${locale}.json`))
    ).default,
  };
});
