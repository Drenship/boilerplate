import { Pathnames } from "next-intl/navigation";
import { enUS, fr, es, de, it, ru, uk, hi } from "date-fns/locale";

export const CURRENCY = "eur";
export const CURRENCY_SYMBOL = "€";

export const MAX_AWS_SIZE_FILE = 1000; // 1 = 1MB / 1000 = 1GB

export const PASSWORD_REQUIRED = {
  minLength: 8,
  minUpperCase: 1,
  minLowerCase: 1,
  minNumbers: 1,
  minSpecialChars: 1,
};

export const PHONE_REQUIRED = {
  format: /^(\+|00)[1-9]\d{1,14}$/,
  minLength: 9,
  maxLength: 15,
};

export const port = process.env.PORT || 3000;
export const host = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : `http://localhost:${port}`;

// si nouvelle langue mettre a jour le "next-sitemap.config.js"
export type Locale = (typeof locales)[number];
export const defaultLocale = "en" as const;
export const locales = ["en", "fr"] as const;
export type localesType = "en" | "fr" | "es" | "de" | "it" | "ru" | "uk" | "pk";

export const localesFns = {
  en: enUS,
  fr: fr,
  es: es,
  de: de,
  it: it,
  ru: ru,
  uk: uk, // Ukrainian
  pk: hi, // Pakistan -> ticker date hindi
};

export const pathnames = {
  "/": "/",
  "/api": "/api",
} satisfies Pathnames<typeof locales>;

// Use the default: `always`
export const localePrefix = "always";

export type AppPathnames = keyof typeof pathnames;

export const publicPages = [
  "/",
  "/marketplace",
  "/marketplace/.*",
  "/explorer",
  "/explorer/.*",
  "/blog",
  "/blog/.*",
  "/general-conditions-of-use",
  "/privacy-policy",
];

export const authPages = [
  "/auth/sign-in",
  "/auth/sign-up",
  "/auth/recovery",
  "/auth/error",
];

export const adminPages = [
  "/admin",
  "/admin/.*",
  "/hub/admin",
  "/hub/admin/.*",
  "/test",
  "/test/.*",
];