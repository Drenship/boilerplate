import { cookies } from "next/headers";
import { UAParser } from "ua-parser-js";

export async function extractSessionMetadata(req: any) {
  // Analyser l'agent utilisateur
  const userAgent = req.headers.get("user-agent");
  const parser = new UAParser(userAgent);
  const result = parser.getResult();

  // Extraction de l'IP
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0] || // Cas des proxys
    req.ip || // Fourni par Next.js en Edge Middleware
    req.socket?.remoteAddress || // Fallback pour IP locale
    "Unknown IP";

  // Extraction des informations du navigateur
  const browser = `${result.browser.name || "Unknown Browser"} ${
    result.browser.version || ""
  }`.trim();

  // Extraction des informations de l'appareil
  const device = result.device.model
    ? `${result.device.vendor || "Unknown Vendor"} ${result.device.model}`
    : result.os.name || "Unknown Device";

  // Type de périphérique (desktop, mobile, tablette, etc.)
  const type =
    result.device.type || (userAgent?.includes("Mobi") ? "mobile" : "desktop");

  // Données additionnelles : Système d'exploitation
  const os = `${result.os.name || "Unknown OS"} ${
    result.os.version || ""
  }`.trim();

  // Localisation potentielle avec une API tierce (par exemple, GeoIP)
  let location = "Unknown Location";
  if (ip && ip !== "Unknown IP") {
    try {
      const geoData = await fetch(`https://ipapi.co/${ip}/json/`).then((res) =>
        res.json()
      );
      location = `${geoData.city || "Unknown City"}, ${
        geoData.country_name || "Unknown Country"
      }`;
    } catch (error) {
      console.error("Error fetching geolocation data:", error);
    }
  }

  // Retour des métadonnées enrichies
  return {
    ip,
    browser,
    device,
    type,
    os,
    location,
  };
}

export async function encryptSessionMetadata(req: any) {
  const cookieStore = await cookies();
  // Ajouter req.context
  const metadata = await extractSessionMetadata(req);

  // Convertir les métadonnées en JSON et les encoder en Base64
  const metadataBase64 = Buffer.from(JSON.stringify(metadata)).toString(
    "base64"
  );

  cookieStore.set({
    name: "SESSION_METADATA_COOKIE_NAME",
    value: metadataBase64,
    httpOnly: true,
    path: "/",
    maxAge: 60 * 60 * 24 * 14
  });
}

export async function decryptSessionMetadata() {
  try {
    // Récupérer le cookie
    const cookieStore = await cookies();
    const metadataCookie = cookieStore.get("SESSION_METADATA_COOKIE_NAME");

    if (!metadataCookie) {
      console.error("Cookie 'SESSION_METADATA_COOKIE_NAME' non trouvé.");
      return null;
    }

    // Décoder la valeur Base64
    const decodedValue = Buffer.from(metadataCookie.value, "base64").toString(
      "utf-8"
    );

    // Convertir en JSON
    const metadata = JSON.parse(decodedValue);
    return metadata;
  } catch (error) {
    console.error("Erreur lors du décryptage du cookie:", error);
    return null;
  }
}
