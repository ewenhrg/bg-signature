import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { useLocale } from "@/context/LocaleContext";
import { siteConfig } from "@/lib/catalogue";
import type { Locale } from "@/types";

export function Header() {
  const { locale, setLocale, tr } = useLocale();
  const { pathname } = useLocation();
  const base = `/${locale}`;
  const isHome = pathname === base || pathname === `${base}/`;
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname, locale]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 40);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const offset = scrolled
      ? "calc(3.75rem + env(safe-area-inset-top, 0px))"
      : "calc(4.25rem + env(safe-area-inset-top, 0px))";
    document.documentElement.style.setProperty("--header-offset", offset);
  }, [scrolled]);

  /** Light text over the hero photo, dark text once we're on a light surface. */
  const onPhoto = isHome && !scrolled && !menuOpen;
  const solid = !isHome || scrolled;

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    [
      "relative py-1 text-sm font-semibold tracking-wide transition-colors",
      "after:absolute after:-bottom-0.5 after:left-0 after:h-[2px] after:rounded-full after:bg-sun-500 after:transition-all",
      isActive ? "after:w-full" : "after:w-0 hover:after:w-full",
      onPhoto
        ? isActive
          ? "text-white"
          : "text-white/75 hover:text-white"
        : isActive
          ? "text-lagoon-600"
          : "text-ink-700 hover:text-lagoon-600",
    ].join(" ");

  const mobileLinkClass = ({ isActive }: { isActive: boolean }) =>
    `flex min-h-14 items-center justify-between border-b border-mist-100 py-4 font-display text-xl font-semibold transition-colors ${
      isActive ? "text-lagoon-600" : "text-ink-900 hover:text-lagoon-600"
    }`;

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 safe-pt transition-all duration-500 ${
        solid
          ? "border-b border-mist-200/70 bg-mist-50/85 backdrop-blur-xl"
          : "border-b border-transparent"
      }`}
    >
      <div
        className={`shell flex items-center justify-between gap-3 transition-all duration-500 ${
          scrolled ? "py-2.5" : "py-4"
        }`}
      >
        <Link
          to={base}
          className="group flex min-w-0 items-center gap-3"
          aria-label={siteConfig.brand}
        >
          <span
            className={`font-display flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-sm font-bold tracking-tight transition-all duration-500 ${
              onPhoto
                ? "border border-white/25 bg-white/10 text-white backdrop-blur-md"
                : "bg-gradient-to-br from-lagoon-500 to-lagoon-700 text-white shadow-[0_10px_24px_-12px_rgba(5,110,127,0.8)]"
            }`}
          >
            BG
          </span>
          <span className="min-w-0">
            <span
              className={`font-display block truncate text-[15px] font-semibold tracking-tight transition-colors duration-500 sm:text-lg ${
                onPhoto ? "text-white" : "text-ink-900"
              }`}
            >
              {siteConfig.brand}
            </span>
            <span
              className={`hidden truncate text-[11px] font-medium tracking-wide transition-colors duration-500 sm:block ${
                onPhoto ? "text-white/55" : "text-ink-400"
              }`}
            >
              {siteConfig.tagline[locale] || siteConfig.tagline.fr}
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-8 lg:flex">
          <NavLink to={base} end className={linkClass}>
            {tr("navHome")}
          </NavLink>
          <NavLink to={`${base}/catalogue`} className={linkClass}>
            {tr("navCatalogue")}
          </NavLink>
          <NavLink to={`${base}/contact`} className={linkClass}>
            {tr("navContact")}
          </NavLink>
          <LangSwitch locale={locale} setLocale={setLocale} onPhoto={onPhoto} />
          <Link
            to={`${base}/catalogue`}
            className={`btn btn-sm ${onPhoto ? "btn-outline-light" : "btn-lagoon"}`}
          >
            {tr("heroCta")}
          </Link>
        </nav>

        <div className="flex items-center gap-2 lg:hidden">
          <LangSwitch
            locale={locale}
            setLocale={setLocale}
            onPhoto={onPhoto}
            compact
          />
          <button
            type="button"
            aria-label={menuOpen ? "Fermer le menu" : "Ouvrir le menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
            className={`flex h-11 w-11 items-center justify-center rounded-xl border transition ${
              onPhoto
                ? "border-white/25 bg-white/10 text-white backdrop-blur-md"
                : "border-mist-200 bg-white text-ink-900"
            }`}
          >
            <span className="flex w-5 flex-col gap-[5px]">
              <span
                className={`block h-[2px] w-full rounded-full bg-current transition duration-300 ${
                  menuOpen ? "translate-y-[7px] rotate-45" : ""
                }`}
              />
              <span
                className={`block h-[2px] w-full rounded-full bg-current transition duration-300 ${
                  menuOpen ? "opacity-0" : ""
                }`}
              />
              <span
                className={`block h-[2px] w-full rounded-full bg-current transition duration-300 ${
                  menuOpen ? "-translate-y-[7px] -rotate-45" : ""
                }`}
              />
            </span>
          </button>
        </div>
      </div>

      {menuOpen ? (
        <div className="fixed inset-0 z-50 flex flex-col bg-mist-50 safe-pt lg:hidden">
          <div className="shell flex items-center justify-between py-4">
            <span className="font-display text-lg font-semibold text-ink-900">
              {siteConfig.brand}
            </span>
            <button
              type="button"
              aria-label="Fermer"
              onClick={() => setMenuOpen(false)}
              className="flex h-11 w-11 items-center justify-center rounded-xl border border-mist-200 bg-white text-ink-900"
            >
              ✕
            </button>
          </div>

          <nav className="shell flex-1 overflow-y-auto pt-2">
            <NavLink to={base} end className={mobileLinkClass}>
              {tr("navHome")}
              <span aria-hidden className="text-ink-400">
                →
              </span>
            </NavLink>
            <NavLink to={`${base}/catalogue`} className={mobileLinkClass}>
              {tr("navCatalogue")}
              <span aria-hidden className="text-ink-400">
                →
              </span>
            </NavLink>
            <NavLink to={`${base}/contact`} className={mobileLinkClass}>
              {tr("navContact")}
              <span aria-hidden className="text-ink-400">
                →
              </span>
            </NavLink>

            <Link
              to={`${base}/catalogue`}
              className="btn btn-primary mt-8 w-full"
              onClick={() => setMenuOpen(false)}
            >
              {tr("heroCta")}
            </Link>
          </nav>

          <p className="shell safe-pb pb-6 text-xs text-ink-400">
            {siteConfig.tagline[locale] || siteConfig.tagline.fr}
          </p>
        </div>
      ) : null}
    </header>
  );
}

function LangSwitch({
  locale,
  setLocale,
  onPhoto,
  compact = false,
}: {
  locale: Locale;
  setLocale: (l: Locale) => void;
  onPhoto: boolean;
  compact?: boolean;
}) {
  return (
    <div
      className={`flex items-center rounded-full p-1 text-[11px] font-bold transition ${
        onPhoto
          ? "border border-white/20 bg-white/10 backdrop-blur-md"
          : "border border-mist-200 bg-white"
      }`}
      role="group"
      aria-label="Language"
    >
      {(["fr", "bg"] as const).map((code) => {
        const active = locale === code;
        return (
          <button
            key={code}
            type="button"
            onClick={() => setLocale(code)}
            className={`rounded-full uppercase transition ${
              compact ? "min-h-11 min-w-11" : "px-3 py-1.5"
            } ${
              active
                ? "bg-gradient-to-br from-lagoon-500 to-lagoon-700 text-white shadow-[0_6px_16px_-8px_rgba(5,110,127,0.9)]"
                : onPhoto
                  ? "text-white/70 hover:text-white"
                  : "text-ink-400 hover:text-ink-900"
            }`}
          >
            {code}
          </button>
        );
      })}
    </div>
  );
}
