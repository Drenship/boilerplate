import { NextRequest, NextResponse } from "next/server";

// Liste des User-Agent suspects connus
const blacklistedAgents = [
  "BadBot",
  "Scrapy",
  "curl",
  "HttpClient",
  "wget",
  "Java",
  "python-requests",
  "PhantomJS",
  "Screaming Frog",
  "Node.js",
  "Axios",
  "PostmanRuntime",
];

// Liste des IP suspectes connues
const blacklistedIPs = ["203.0.113.0", "198.51.100.1"];

// Liste des préfixes d'IP suspectes
const blacklistedIPPrefixes = ["203.0.113.", "10.0."];

// Liste blanche pour certains User-Agent ou IP autorisés
const whitelistedIPs = ["127.0.0.1", "::1"];
const whitelistedAgents = ["Googlebot", "Bingbot"];

// Vérification des comportements suspects (anti-bot avancé)
async function detectBotBehavior(req: NextRequest): Promise<boolean> {
  const headers = req.headers;

  // Vérifier les en-têtes courants utilisés par les bots
  const suspiciousHeaders = [
    "x-bot", // Header ajouté par certains bots
    "x-scrapy", // Indicateur d'un bot Scrapy
    //"x-forwarded-proto", // Vérification abusive mais activer par default sur mon site
  ];

  for (const header of suspiciousHeaders) {
    if (headers.has(header)) {
      console.warn(`Blocage : En-tête suspect détecté (${header})`);
      return true;
    }
  }

  // Vérifier l'absence d'en-têtes attendus (exemple : cookies, user-agent)
  if (!headers.has("cookie") && !headers.has("user-agent")) {
    console.warn(
      "Blocage : Absence d'en-têtes critiques (Cookie ou User-Agent)"
    );
    return true;
  }

  // Vérifier l'absence d'informations communes des navigateurs (langue, accept)
  if (!headers.has("accept-language") || !headers.has("accept")) {
    console.warn(
      "Blocage : Absence d'en-têtes typiques d'un navigateur (Accept-Language ou Accept)"
    );
    return true;
  }

  return false;
}

export async function antibot(
  req: NextRequest,
  ip: string
): Promise<NextResponse | void> {
  const userAgent = req.headers.get("user-agent")?.toLowerCase() || "";

  // Vérification des IP sur liste blanche
  if (whitelistedIPs.includes(ip)) {
    return;
  }

  // Vérification des User-Agent sur liste blanche
  if (
    whitelistedAgents.some((agent) => userAgent.includes(agent.toLowerCase()))
  ) {
    console.info(
      `Requête autorisée (User-Agent sur liste blanche) : User-Agent=${userAgent}`
    );
    return;
  }

  // Vérification des IP suspectes exactes
  if (blacklistedIPs.includes(ip)) {
    console.warn(`Blocage (IP sur liste noire) : IP=${ip}`);
    return new NextResponse("Access denied.", { status: 403 });
  }

  // Vérification des IP par préfixe
  if (blacklistedIPPrefixes.some((prefix) => ip.startsWith(prefix))) {
    console.warn(`Blocage (IP correspondant à un préfixe suspect) : IP=${ip}`);
    return new NextResponse("Access denied.", { status: 403 });
  }

  // Vérification des User-Agent suspects
  if (
    blacklistedAgents.some((agent) => userAgent.includes(agent.toLowerCase()))
  ) {
    console.warn(
      `Blocage (User-Agent sur liste noire) : User-Agent=${userAgent}`
    );
    return new NextResponse("Access denied.", { status: 403 });
  }

  // Vérification des comportements suspects
  if (await detectBotBehavior(req)) {
    return new NextResponse("Access denied.", { status: 403 });
  }
}
