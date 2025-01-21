import { useEffect } from "react";

/**
 * A custom hook to lock or unlock body scroll based on a condition.
 * @param isLocked - Boolean to indicate whether body scroll should be locked.
 */
const useLockBodyScroll = (isLocked: boolean) => {
  useEffect(() => {
    // Appliquer les changements uniquement si la valeur change
    if (isLocked) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    // Nettoyage : rétablir l'overflow à "auto" si le composant est démonté
    return () => {
      document.body.style.overflow = "";
    };
  }, [isLocked]); // Déclencher uniquement lorsque `isLocked` change
};

export default useLockBodyScroll;
