"use client";
import { useEffect, useRef, useState, useCallback } from "react";

const useOutsideClickAndEscape = () => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null); // Référence pour l'élément principal
  const refButton = useRef<HTMLButtonElement | null>(null); // Référence pour le bouton de toggle
  const disableClickOutsideRef = useRef(false); // Désactiver temporairement la détection de clic extérieur

  const onClose = () => setIsOpen(false);

  const onOpen = () => setIsOpen(true);

  const onToggle = (event: React.MouseEvent) => {
    event.stopPropagation();
    disableClickOutsideRef.current = true; // Désactiver temporairement le handleEvent
    setIsOpen((prev) => !prev);

    // Réactiver la détection après un court délai
    setTimeout(() => {
      disableClickOutsideRef.current = false;
    }, 100); // Délai court pour éviter le conflit avec l'écouteur de clic extérieur
  };

  const handleEvent = useCallback(
    (event: MouseEvent | KeyboardEvent) => {
      if (disableClickOutsideRef.current) return; // Si désactivé, ignorer l'événement

      if (
        event instanceof MouseEvent &&
        ref.current &&
        !ref.current.contains(event.target as Node) &&
        refButton.current && 
        !refButton.current.contains(event.target as Node) // Exclure aussi les clics sur le bouton
      ) {
        onClose();
      }
      if (event instanceof KeyboardEvent && event.key === "Escape") {
        onClose();
      }
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("mousedown", handleEvent);
      document.addEventListener("keydown", handleEvent);
    } else {
      document.removeEventListener("mousedown", handleEvent);
      document.removeEventListener("keydown", handleEvent);
    }

    return () => {
      document.removeEventListener("mousedown", handleEvent);
      document.removeEventListener("keydown", handleEvent);
    };
  }, [isOpen, handleEvent]);

  return { ref, refButton, isOpen, onOpen, onClose, onToggle };
};

export default useOutsideClickAndEscape;