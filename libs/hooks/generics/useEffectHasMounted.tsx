"use client";
import { useEffect, useState } from "react";

// Hook personnalisé pour exécuter un useEffect seulement après le montage du composant
export default function useEffectHasMounted(
  effect: React.EffectCallback,
  deps: React.DependencyList = []
) {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    if (hasMounted) {
      return effect();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasMounted, ...deps]);
}
