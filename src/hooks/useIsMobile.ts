import { useEffect, useState } from "react";

const MEDIA_QUERY = "(max-width: 767px)";

export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== "undefined" ? window.matchMedia(MEDIA_QUERY).matches : false,
  );

  useEffect(() => {
    const mql = window.matchMedia(MEDIA_QUERY);
    const handler = () => setIsMobile(mql.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, []);

  return isMobile;
}
