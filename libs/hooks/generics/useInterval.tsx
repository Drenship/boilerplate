"use client";
import { useEffect, useRef } from "react";

// Définition des types pour useInterval
export default function useInterval(callback: () => void, delay: number | null) {
  const savedCallback = useRef<(() => void) | undefined>();
  let id: NodeJS.Timeout | null = null;

  // Mémorise la dernière version de callback
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Configure l'intervalle
  useEffect(() => {
    function tick() {
      if (typeof savedCallback?.current === "function") {
        savedCallback.current();
      }
    }

    if (delay !== null && delay > 0) {
      id = setInterval(tick, delay);
      return () => clearInterval(id);
    }

    if (delay === 0 && id !== null) {
      id = null;
      return () => clearInterval(id);
    }
  }, [delay]);
}
