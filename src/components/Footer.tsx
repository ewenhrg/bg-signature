import { Link } from "react-router-dom";
import { siteConfig, activeCategories } from "@/lib/catalogue";
import { useLocale } from "@/context/LocaleContext";
import { buildWhatsAppReserveUrl, getWhatsAppNumber } from "@/lib/whatsapp";

export function Footer() {
  const { locale, tr } = useLocale();
  const year = new Date().getFullYear();
  const base = `/${locale}`;
  const number = getWhatsAppNumber();
  const href = number
    ? buildWhatsAppReserveUrl({
        locale,
        activityName:
          locale === "bg" ? "обща информация" : "demande d'information",
      })
    : null;

  return (
    <footer className="surface-deep relative mt-auto overflow-hidden text-white">
      <div className="bg-noise pointer-events-none absolute inset-0 opacity-25" />

      <div className="shell relative grid gap-10 py-14 md:grid-cols-[1.4fr_0.8fr_0.8fr] md:gap-12 md:py-20">
        {/* Brand */}
        <div>
          <div className="flex items-center gap-3">
            <span className="font-display flex h-11 w-11 items-center justify-center rounded-xl border border-white/20 bg-white/10 text-sm font-bold backdrop-blur-md">
              BG
            </span>
            <p className="font-display text-xl font-semibold tracking-tight sm:text-2xl">
              {siteConfig.brand}
            </p>
          </div>
          <p className="mt-5 max-w-sm text-sm leading-relaxed text-white/60">
            {siteConfig.tagline[locale] || siteConfig.tagline.fr}
          </p>
          <div className="hairline-gold mt-6" />

          {href ? (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-sm btn-outline-light mt-7"
            >
              {tr("openWhatsApp")}
            </a>
          ) : null}
        </div>

        {/* Nav */}
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-lagoon-300">
            {tr("footerNav")}
          </p>
          <ul className="mt-5 space-y-1 text-sm text-white/65">
            <li>
              <Link to={base} className="block py-2.5 transition hover:text-white">
                {tr("navHome")}
              </Link>
            </li>
            <li>
              <Link
                to={`${base}/catalogue`}
                className="block py-2.5 transition hover:text-white"
              >
                {tr("navCatalogue")}
              </Link>
            </li>
            <li>
              <Link
                to={`${base}/contact`}
                className="block py-2.5 transition hover:text-white"
              >
                {tr("navContact")}
              </Link>
            </li>
          </ul>
        </div>

        {/* Categories */}
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-lagoon-300">
            {tr("categoriesTitle")}
          </p>
          <ul className="mt-5 space-y-1 text-sm text-white/65">
            {activeCategories.slice(0, 6).map((cat) => (
              <li key={cat.key}>
                <Link
                  to={`${base}/catalogue#cat-${cat.key}`}
                  className="block py-2.5 transition hover:text-white"
                >
                  {cat.label[locale] || cat.label.fr}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="relative border-t border-white/10">
        <div className="shell safe-pb flex flex-wrap items-center justify-between gap-3 py-5">
          <p className="text-xs text-white/45">
            © {year} {siteConfig.brand}. {tr("footerRights")}
          </p>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-white/45">
            {siteConfig.instagram ? (
              <a
                href={siteConfig.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-10 items-center transition hover:text-white"
              >
                Instagram
              </a>
            ) : null}
            {siteConfig.facebook ? (
              <a
                href={siteConfig.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-10 items-center transition hover:text-white"
              >
                Facebook
              </a>
            ) : null}
            <span>Français · Български</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
