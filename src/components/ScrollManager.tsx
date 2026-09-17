import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Keeps navigation predictable with a fixed header:
 * new page -> top, in-page hash -> scroll to the section.
 */
export function ScrollManager() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    function toTop() {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" as ScrollBehavior });
    }

    if (!hash) {
      toTop();
      return;
    }

    const id = decodeURIComponent(hash.slice(1));
    // Sections render on the same tick, one frame is enough to find them.
    const raf = requestAnimationFrame(() => {
      const target = document.getElementById(id);
      // No matching section: start at the top rather than keep a restored offset.
      if (target) target.scrollIntoView({ behavior: "smooth" });
      else toTop();
    });
    return () => cancelAnimationFrame(raf);
  }, [pathname, hash]);

  return null;
}
