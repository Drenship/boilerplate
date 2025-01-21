import { useEffect, useState } from "react";

/**
 * A custom hook that checks if the current screen size is large (>= 640px).
 * @returns A boolean indicating if the screen size is large.
 */
const useIsLargeScreen = (): boolean => {
  const [isLargeScreen, setIsLargeScreen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsLargeScreen(window.innerWidth >= 640);
    };

    // Initial check
    handleResize();

    // Add resize event listener
    window.addEventListener("resize", handleResize);

    return () => {
      // Cleanup the event listener
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return isLargeScreen;
};

export default useIsLargeScreen;
