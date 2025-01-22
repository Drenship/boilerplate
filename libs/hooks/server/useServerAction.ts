import { ZodSchema } from "zod";
import { auth } from "@/libs/auth/auth";

type ServerActionOptions<TInput, TOutput> = {
  role?: string | string[]; // Rôle(s) requis, facultatif
  schema?: ZodSchema<TInput>; // Schéma de validation Zod, facultatif
  action: (input: TInput, session: any) => Promise<TOutput>; // Fonction métier
};

export function useServerAction<TInput = unknown, TOutput = unknown>({
  role,
  schema,
  action,
}: ServerActionOptions<TInput, TOutput>): (input: TInput) => Promise<TOutput> {
  return async (input: TInput) => {
    // Récupération de la session utilisateur via une fonction `auth()`
    const session = await auth();

    // Vérification des rôles si un rôle est défini
    if (role && !hasRequiredRole(session, role)) {
      throw new Error("Unauthorized: Insufficient permissions");
    }

    // Validation des données via le schéma Zod si défini
    const parsedInput = schema ? schema.parse(input) : input;

    // Exécution de l'action métier
    return await action(parsedInput, session);
  };
}

// Fonction utilitaire pour vérifier si un utilisateur a les rôles requis
function hasRequiredRole(session: any, role: string | string[]): boolean {
  if (!session) return false; // Aucun utilisateur connecté

  // juste need user is auth
  if (role === "USER" || (Array.isArray(role) && role.includes("USER"))) {
    return true;
  }

  // Admin bypass : tous les rôles sont autorisés pour les administrateurs
  if (
    (role === "ADMIN" || (Array.isArray(role) && role.includes("ADMIN"))) &&
    session.user.isAdmin
  ) {
    return true;
  }

  // Vérification des rôles utilisateur
  if (Array.isArray(role)) {
    return role.some((r) => session.roles?.includes(r));
  }
  return session.roles?.includes(role);
}
