"use client";
import { useEffect, useRef } from "react";

// Définition des types pour useTimeout
/**
 *
 * @param {function} callback - La fonction à exécuter après le délai
 * @param {number} delay - Le délai en millisecondes avant d'exécuter la fonction
 * @param {boolean | null | string} restart - Condition pour annuler et redémarrer le Timeout
 */

export default function useTimeout(
  callback: () => void,
  delay: number,
  restart: boolean | null | string
) {
  const savedCallback = useRef<(() => void) | undefined>();

  // Mémorise la dernière version de callback
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Configure le timeout
  useEffect(() => {
    if (restart === false) return;

    function tick() {
      if (typeof savedCallback?.current === "function") {
        savedCallback.current();
      }
    }

    if (delay !== 0) {
      const id = setTimeout(tick, delay);
      return () => clearTimeout(id);
    }
  }, [restart, delay]);
}
