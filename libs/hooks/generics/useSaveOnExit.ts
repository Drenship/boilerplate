import { useEffect, useRef } from "react";

interface UseSaveOnExitProps {
  handlerSaving: (data: any) => void; // Fonction pour sauvegarder les données
  data: any; // Données à sauvegarder
  debounceTime?: number; // Optionnel : Temps de décalage entre deux sauvegardes (en ms)
}

/**
 * Un hook personnalisé pour sauvegarder des données à la fermeture ou au changement de page.
 * @param handlerSaving - Fonction pour sauvegarder les données.
 * @param data - Données à sauvegarder.
 * @param debounceTime - Optionnel : Temps de décalage pour éviter des sauvegardes trop fréquentes.
 */
export function useSaveOnExit({
  handlerSaving,
  data,
  debounceTime = 500,
}: UseSaveOnExitProps) {
  const dataRef = useRef(data);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Met à jour la référence des données chaque fois qu'elles changent
  useEffect(() => {
    dataRef.current = data;
  }, [data]);

  // Fonction de sauvegarde avec gestion de débounce
  const saveData = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    timeoutRef.current = setTimeout(() => {
      handlerSaving(dataRef.current);
    }, debounceTime);
  };

  useEffect(() => {
    // Sauvegarde lorsque l'utilisateur quitte la page ou change d'onglet
    const handleBeforeUnload = () => {
      handlerSaving(dataRef.current);
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") {
        saveData();
      }
    });

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [handlerSaving]);

  // Permet une sauvegarde manuelle si nécessaire
  return { saveData };
}