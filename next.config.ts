import createNextIntlPlugin from "next-intl/plugin";
import { NextConfig } from "next";

// Configurez votre plugin `next-intl` avec le chemin vers `i18n/request.ts`
const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

/** @type {import('next').NextConfig} */
const nextConfig: NextConfig = {
  reactStrictMode: true,
  productionBrowserSourceMaps: false,
  typescript: {
    // Ignore les erreurs TypeScript uniquement en production
    ignoreBuildErrors: process.env.NODE_ENV === "production",
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
      {
        protocol: "http",
        hostname: "localhost",
        port: "4000",
        pathname: "/processed/**",
      },
    ],
  },
  webpack: (config) => {
    // Votre configuration webpack existante...
    return config;
  },
  trailingSlash: false, // met un / a la fin de tout les url si true
  //compiler: {
  //  // Cela permet à Next.js de faire confiance aux en-têtes du proxy inverse
  //  trustHostHeader: true,
  //},
};

export default withNextIntl(nextConfig);