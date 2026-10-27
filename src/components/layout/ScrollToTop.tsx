import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Global Scroll Restoration Component.
 * - Resets window scroll position to (0, 0) upon route transitions.
 * - Intelligently preserves hash target scrolling if an anchor (e.g., #table-of-contents) is present.
 */
export default function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      // Allow deep-linking or Table of Contents anchor navigation
      const id = hash.replace("#", "");
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
        return;
      }
    }
    // Instant reset to the top of the new page
    window.scrollTo({ top: 0, left: 0, behavior: "instant" as ScrollBehavior });
  }, [pathname, hash]);

  return null;
}
