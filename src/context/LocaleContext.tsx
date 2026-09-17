import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useLocation, useNavigate } from "react-router-dom";
import type { Locale } from "@/types";
import { t, type UiKey } from "@/i18n/ui";
import { siteConfig } from "@/lib/catalogue";

type LocaleContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  tr: (key: UiKey) => string;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

function localeFromPath(pathname: string): Locale | null {
  const seg = pathname.split("/").filter(Boolean)[0];
  if (seg === "fr" || seg === "bg") return seg;
  return null;
}

export function LocaleProvider({ children }: { children: ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const pathLocale = localeFromPath(location.pathname);
  const [locale, setLocaleState] = useState<Locale>(
    pathLocale || siteConfig.defaultLocale || "fr"
  );

  useEffect(() => {
    if (pathLocale && pathLocale !== locale) {
      setLocaleState(pathLocale);
    }
  }, [pathLocale, locale]);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const setLocale = useCallback(
    (next: Locale) => {
      setLocaleState(next);
      const parts = location.pathname.split("/").filter(Boolean);
      if (parts[0] === "fr" || parts[0] === "bg") {
        parts[0] = next;
      } else {
        parts.unshift(next);
      }
      navigate(`/${parts.join("/")}${location.search}${location.hash}`, {
        replace: true,
      });
    },
    [location.hash, location.pathname, location.search, navigate]
  );

  const value = useMemo(
    () => ({
      locale,
      setLocale,
      tr: (key: UiKey) => t(locale, key),
    }),
    [locale, setLocale]
  );

  return (
    <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
  );
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useLocale must be used within LocaleProvider");
  return ctx;
}
