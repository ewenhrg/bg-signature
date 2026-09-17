import { Link } from "react-router-dom";
import { useLocale } from "@/context/LocaleContext";
import {
  activeCategories,
  activities,
  getFeaturedActivities,
  getHeroImages,
  siteConfig,
} from "@/lib/catalogue";
import { ActivityCard } from "@/components/ActivityCard";
import { Reveal } from "@/components/Reveal";
import { buildWhatsAppReserveUrl, getWhatsAppNumber } from "@/lib/whatsapp";
import type { UiKey } from "@/i18n/ui";

const FEATURES: { title: UiKey; text: UiKey }[] = [
  { title: "homeFeature1Title", text: "homeFeature1Text" },
  { title: "homeFeature2Title", text: "homeFeature2Text" },
  { title: "homeFeature3Title", text: "homeFeature3Text" },
];

const STEPS: { title: UiKey; text: UiKey }[] = [
  { title: "step1Title", text: "step1Text" },
  { title: "step2Title", text: "step2Text" },
  { title: "step3Title", text: "step3Text" },
];

const heroImage = getHeroImages(1)[0];
const featured = getFeaturedActivities(6);

export function HomePage() {
  const { locale, tr } = useLocale();
  const whatsappNumber = getWhatsAppNumber();
  const contactHref = whatsappNumber
    ? buildWhatsAppReserveUrl({
        locale,
        activityName:
          locale === "bg" ? "обща информация" : "demande d'information",
      })
    : null;

  return (
    <div>
      {/* ---------------- Hero ---------------- */}
      <section className="relative min-h-[100svh] overflow-hidden bg-ink-950 text-white max-[420px]:min-h-[100dvh]">
        {heroImage ? (
          <img
            src={heroImage}
            alt=""
            className="animate-ken absolute inset-0 h-full w-full object-cover object-[center_40%]"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-lagoon-700 via-ink-900 to-ink-950" />
        )}

        <div className="scrim-hero" />
        <div className="bg-noise pointer-events-none absolute inset-0 opacity-25" />

        <div className="shell relative flex min-h-[100svh] flex-col justify-end pb-14 pt-28 max-[420px]:pb-10 max-[420px]:pt-24 sm:pb-20 sm:pt-32 md:min-h-[100svh] md:justify-center md:pb-28">
          <p className="animate-fade-up eyebrow flex items-center gap-3 text-lagoon-300">
            <span className="h-px w-8 bg-lagoon-400/70" />
            {tr("heroKicker")}
          </p>

          <h1 className="animate-fade-up-delay-1 text-display-xl mt-4 max-w-[13ch] sm:mt-5 sm:max-w-4xl">
            {siteConfig.brand}
          </h1>

          <p className="animate-fade-up-delay-2 text-body-lg balance mt-4 max-w-xl text-white/85 sm:mt-6">
            {tr("heroSub")}
          </p>

          <div className="animate-fade-up-delay-2 mt-7 flex w-full flex-col gap-3 sm:mt-9 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center">
            <Link to={`/${locale}/catalogue`} className="btn btn-primary w-full sm:w-auto">
              {tr("heroCta")}
              <span aria-hidden>→</span>
            </Link>
            <Link
              to={`/${locale}/contact`}
              className="btn btn-outline-light w-full sm:w-auto"
            >
              {tr("navContact")}
            </Link>
          </div>

          {/* Trust row — hide on very short phones to keep the hero readable */}
          <div className="animate-fade-up-delay-3 mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-white/15 pt-5 max-[380px]:hidden sm:mt-12 sm:gap-x-8 sm:gap-y-4 sm:pt-6">
            <HeroStat value={`${activities.length}+`} label={tr("activities")} />
            <HeroStat
              value={`${activeCategories.length}`}
              label={locale === "bg" ? "категории" : "catégories"}
            />
            <HeroStat value="FR · BG" label={locale === "bg" ? "езици" : "langues"} />
          </div>
        </div>
      </section>

      {/* ---------------- Categories ---------------- */}
      <section className="shell py-16 md:py-24">
        <Reveal className="max-w-2xl">
          <p className="eyebrow text-lagoon-600">{tr("categoriesTitle")}</p>
          <h2 className="text-display-md balance mt-3 text-ink-900">
            {tr("categoriesSub")}
          </h2>
          <div className="hairline-gold mt-5" />
        </Reveal>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
          {activeCategories.map((cat, i) => (
            <Reveal key={cat.key} delay={i * 70}>
              <Link
                to={`/${locale}/catalogue#cat-${cat.key}`}
                className="group card card-interactive block h-full overflow-hidden"
              >
                <div className="frame frame-card img-zoom">
                  {cat.cover ? (
                    <img src={cat.cover} alt="" loading="lazy" decoding="async" />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-lagoon-700 to-ink-900" />
                  )}
                  <div className="scrim-card" />
                  <div className="absolute inset-x-0 bottom-0 p-5">
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-lagoon-300">
                      {cat.count} {cat.count > 1 ? tr("activities") : tr("activity")}
                    </p>
                    <h3 className="font-display mt-1.5 text-xl font-semibold text-white sm:text-2xl">
                      {cat.label[locale] || cat.label.fr}
                    </h3>
                  </div>
                  <span className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full border border-white/25 bg-ink-950/40 text-white opacity-100 backdrop-blur-sm transition duration-500 md:opacity-0 md:group-hover:opacity-100">
                    →
                  </span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ---------------- Featured activities ---------------- */}
      {featured.length ? (
        <section className="relative py-16 md:py-24">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/60 via-transparent to-white/60" />
          <div className="shell relative">
            <Reveal className="flex flex-wrap items-end justify-between gap-5">
              <div className="max-w-xl">
                <p className="eyebrow text-lagoon-600">{tr("featuredTitle")}</p>
                <h2 className="text-display-md balance mt-3 text-ink-900">
                  {tr("featuredSub")}
                </h2>
                <div className="hairline-gold mt-5" />
              </div>
              <Link
                to={`/${locale}/catalogue`}
                className="btn btn-outline-dark btn-sm"
              >
                {tr("viewAll")}
                <span aria-hidden>→</span>
              </Link>
            </Reveal>

            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {featured.map((activity, i) => (
                <Reveal key={activity.id} delay={i * 60}>
                  <ActivityCard activity={activity} />
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* ---------------- Steps ---------------- */}
      <section className="shell py-16 md:py-24">
        <Reveal className="max-w-2xl">
          <p className="eyebrow text-lagoon-600">{tr("stepsTitle")}</p>
          <h2 className="text-display-md balance mt-3 text-ink-900">
            {tr("stepsSub")}
          </h2>
          <div className="hairline-gold mt-5" />
        </Reveal>

        <div className="relative mt-12 grid gap-8 md:grid-cols-3 md:gap-6">
          <div
            aria-hidden
            className="absolute left-0 right-0 top-7 hidden h-px bg-gradient-to-r from-mist-200 via-lagoon-300/60 to-mist-200 md:block"
          />
          {STEPS.map((step, i) => (
            <Reveal key={step.title} delay={i * 110} className="relative">
              <span className="font-display relative z-10 flex h-14 w-14 items-center justify-center rounded-full border border-lagoon-200 bg-white text-lg font-bold text-lagoon-600 shadow-[0_10px_24px_-12px_rgba(5,110,127,0.5)]">
                {i + 1}
              </span>
              <h3 className="text-display-sm mt-5 text-ink-900">{tr(step.title)}</h3>
              <p className="mt-2.5 text-[15px] leading-relaxed text-ink-500">
                {tr(step.text)}
              </p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ---------------- Why us ---------------- */}
      <section className="shell pb-16 md:pb-24">
        <Reveal className="max-w-2xl">
          <p className="eyebrow text-lagoon-600">{tr("whyUs")}</p>
          <h2 className="text-display-md balance mt-3 text-ink-900">
            {siteConfig.tagline[locale] || siteConfig.tagline.fr}
          </h2>
          <div className="hairline-gold mt-5" />
        </Reveal>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature, i) => (
            <Reveal key={feature.title} delay={i * 80}>
              <div className="card h-full p-6 sm:p-7">
                <span className="font-display block text-4xl font-bold text-gradient-gold sm:text-5xl">
                  0{i + 1}
                </span>
                <h3 className="text-display-sm mt-4 text-ink-900">
                  {tr(feature.title)}
                </h3>
                <p className="mt-2.5 text-[15px] leading-relaxed text-ink-500">
                  {tr(feature.text)}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ---------------- CTA band ---------------- */}
      <section className="shell pb-16 md:pb-24">
        <Reveal>
          <div className="surface-deep relative overflow-hidden rounded-[2rem] px-6 py-12 text-white sm:px-10 md:px-14 md:py-16">
            <div className="bg-noise pointer-events-none absolute inset-0 opacity-25" />
            <div
              aria-hidden
              className="animate-float pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-lagoon-500/20 blur-3xl"
            />
            <div className="relative max-w-2xl">
              <p className="eyebrow text-lagoon-300">{siteConfig.brand}</p>
              <h2 className="text-display-md balance mt-4">{tr("ctaTitle")}</h2>
              <p className="text-body-lg mt-4 text-white/75">{tr("ctaText")}</p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                {contactHref ? (
                  <a
                    href={contactHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-primary"
                  >
                    {tr("openWhatsApp")}
                  </a>
                ) : (
                  <Link to={`/${locale}/contact`} className="btn btn-primary">
                    {tr("navContact")}
                  </Link>
                )}
                <Link to={`/${locale}/catalogue`} className="btn btn-outline-light">
                  {tr("heroCta")}
                </Link>
              </div>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
}

function HeroStat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <p className="font-display text-2xl font-bold leading-none text-white sm:text-3xl">
        {value}
      </p>
      <p className="mt-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-white/55">
        {label}
      </p>
    </div>
  );
}
