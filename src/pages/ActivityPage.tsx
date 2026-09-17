import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useLocale } from "@/context/LocaleContext";
import { activities, getActivityBySlug, getCategoryLabel } from "@/lib/catalogue";
import { formatPrice, fromPrice, pickLocalized } from "@/lib/i18n";
import { ReserveButton } from "@/components/ReserveButton";
import { ActivityCard } from "@/components/ActivityCard";
import { Lightbox } from "@/components/Lightbox";
import { Reveal } from "@/components/Reveal";
import type { Locale } from "@/types";

const DAY_LABELS: Record<Locale, string[]> = {
  fr: ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"],
  bg: ["Нед", "Пон", "Вто", "Сря", "Чет", "Пет", "Съб"],
};

export function ActivityPage() {
  const { slug = "" } = useParams();
  const { locale, tr } = useLocale();
  const activity = getActivityBySlug(slug);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const name = activity ? pickLocalized(activity.name, locale) : "";
  const description = activity ? pickLocalized(activity.description, locale) : "";
  const notes = activity ? pickLocalized(activity.notes, locale) : "";
  const price = activity ? fromPrice(activity) : null;
  const path = `/${locale}/catalogue/${slug}`;
  const images = activity?.images || [];

  const related = activity
    ? activities
        .filter(
          (a) =>
            a.id !== activity.id && a.category === activity.category && a.images?.[0]
        )
        .slice(0, 3)
    : [];

  const availableDays = activity?.availableDays || [];
  const allDays = availableDays.length === 0 || availableDays.every(Boolean);

  if (!activity) {
    return (
      <div className="shell py-24 text-center">
        <p className="text-ink-500">{tr("noResults")}</p>
        <Link to={`/${locale}/catalogue`} className="btn btn-lagoon mt-7">
          {tr("backToCatalogue")}
        </Link>
      </div>
    );
  }

  return (
    <div className="pb-32 lg:pb-0">
      {/* ---------------- Banner ---------------- */}
      <section className="relative bg-ink-950">
        <div className="frame frame-banner">
          {images[0] ? (
            <img src={images[0]} alt={name} fetchPriority="high" />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-lagoon-700 via-ink-900 to-ink-950" />
          )}
          <div className="scrim-bottom" />
        </div>

        <div className="absolute inset-x-0 bottom-0">
          <div className="shell pb-6 sm:pb-9 md:pb-12">
            <Link
              to={`/${locale}/catalogue`}
              className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-white/75 transition hover:text-white"
            >
              <span aria-hidden>←</span>
              {tr("backToCatalogue")}
            </Link>

            <p className="eyebrow mt-4 text-lagoon-300 sm:mt-5">
              {getCategoryLabel(activity.category, locale)}
            </p>

            <div className="mt-2.5 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between sm:gap-4">
              <h1 className="text-display-lg balance max-w-3xl text-white">{name}</h1>

              {images.length > 1 ? (
                <button
                  type="button"
                  onClick={() => setLightboxIndex(0)}
                  className="btn btn-sm btn-outline-light w-full sm:w-auto"
                >
                  {tr("viewPhotos")} · {images.length}
                </button>
              ) : null}
            </div>
          </div>
        </div>

        {activity.popular ? (
          <span className="badge-gold absolute left-4 top-[calc(var(--header-offset)+0.75rem)] sm:left-8">
            {tr("popular")}
          </span>
        ) : null}
      </section>

      {/* ---------------- Content ---------------- */}
      <div className="shell py-10 md:py-16">
        <div className="grid gap-10 lg:grid-cols-[1.35fr_0.65fr] lg:gap-14">
          {/* Left column */}
          <div className="order-2 lg:order-1">
            {images.length > 1 ? (
              <Reveal className="mb-10">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="text-display-sm text-ink-900">{tr("gallery")}</h2>
                  <span className="text-xs font-semibold text-ink-400">
                    {images.length} {tr("photos")}
                  </span>
                </div>
                <div className="hairline-gold mt-3" />

                <div className="scrollbar-hide mt-5 -mx-1 flex gap-3 overflow-x-auto px-1 pb-2 sm:mx-0 sm:grid sm:grid-cols-4 sm:overflow-visible sm:px-0">
                  {images.map((src, i) => (
                    <button
                      key={src}
                      type="button"
                      onClick={() => setLightboxIndex(i)}
                      className="group w-36 shrink-0 overflow-hidden rounded-xl sm:w-auto"
                      aria-label={`${tr("gallery")} ${i + 1}`}
                    >
                      <div className="frame frame-square img-zoom rounded-xl border border-mist-200">
                        <img src={src} alt="" loading="lazy" decoding="async" />
                        <div className="absolute inset-0 bg-ink-950/0 transition group-hover:bg-ink-950/15" />
                      </div>
                    </button>
                  ))}
                </div>
              </Reveal>
            ) : null}

            {description ? (
              <Reveal className="mb-10">
                <h2 className="text-display-sm text-ink-900">
                  {locale === "bg" ? "За преживяването" : "L'expérience"}
                </h2>
                <div className="hairline-gold mt-3" />
                <div className="prose-activity mt-5">{description}</div>
              </Reveal>
            ) : null}

            {notes ? (
              <Reveal>
                <div className="card border-lagoon-200/70 bg-lagoon-200/10 p-5 sm:p-7">
                  <h2 className="text-display-sm text-ink-900">
                    {tr("practicalInfo")}
                  </h2>
                  <div className="hairline-gold mt-3" />
                  <div className="prose-activity mt-4">{notes}</div>
                </div>
              </Reveal>
            ) : null}
          </div>

          {/* Right column — booking card */}
          <aside className="order-1 lg:order-2 lg:sticky lg:top-[calc(var(--header-offset)+1rem)] lg:self-start">
            <div className="card overflow-hidden">
              <div className="surface-deep px-6 py-5 text-white">
                {price ? (
                  <>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-lagoon-300">
                      {tr("from")}
                    </p>
                    <p className="font-display mt-1 text-4xl font-bold leading-none">
                      {formatPrice(price.amount, price.currency, locale)}
                    </p>
                    <p className="mt-2 text-xs text-white/55">{tr("perPerson")}</p>
                  </>
                ) : (
                  <p className="font-display text-2xl font-semibold">
                    {tr("priceOnRequest")}
                  </p>
                )}
              </div>

              <div className="p-6">
                {price ? (
                  <dl className="space-y-3 border-b border-mist-100 pb-5 text-sm">
                    {activity.priceAdult > 0 ? (
                      <PriceRow
                        label={tr("adults")}
                        value={formatPrice(
                          activity.priceAdult,
                          activity.currency,
                          locale
                        )}
                      />
                    ) : null}
                    {activity.priceChild > 0 ? (
                      <PriceRow
                        label={`${tr("children")}${
                          activity.ageChild ? ` · ${activity.ageChild}` : ""
                        }`}
                        value={formatPrice(
                          activity.priceChild,
                          activity.currency,
                          locale
                        )}
                      />
                    ) : null}
                    {activity.babiesForbidden ? (
                      <PriceRow label={tr("babies")} value={tr("babiesForbidden")} />
                    ) : activity.priceBaby > 0 ? (
                      <PriceRow
                        label={`${tr("babies")}${
                          activity.ageBaby ? ` · ${activity.ageBaby}` : ""
                        }`}
                        value={formatPrice(
                          activity.priceBaby,
                          activity.currency,
                          locale
                        )}
                      />
                    ) : null}
                  </dl>
                ) : null}

                <div className={price ? "mt-5" : ""}>
                  <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-ink-400">
                    {tr("availability")}
                  </p>
                  {allDays ? (
                    <p className="mt-2 text-sm font-semibold text-lagoon-600">
                      {tr("everyDay")}
                    </p>
                  ) : (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {DAY_LABELS[locale].map((label, i) => (
                        <span
                          key={label}
                          className={`rounded-lg px-2 py-1 text-[11px] font-bold ${
                            availableDays[i]
                              ? "bg-lagoon-500/12 text-lagoon-600"
                              : "bg-mist-100 text-ink-400 line-through"
                          }`}
                        >
                          {label}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <ReserveButton
                  activityName={name}
                  activityPath={path}
                  className="mt-6 hidden w-full lg:inline-flex"
                />
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* ---------------- Related ---------------- */}
      {related.length ? (
        <section className="shell pb-16 md:pb-24">
          <Reveal className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="eyebrow text-lagoon-600">
                {getCategoryLabel(activity.category, locale)}
              </p>
              <h2 className="text-display-md mt-2 text-ink-900">
                {locale === "bg" ? "Подобни активности" : "Dans le même esprit"}
              </h2>
              <div className="hairline-gold mt-4" />
            </div>
            <Link to={`/${locale}/catalogue`} className="btn btn-sm btn-outline-dark">
              {tr("viewAll")}
              <span aria-hidden>→</span>
            </Link>
          </Reveal>

          <div className="mt-9 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((item, i) => (
              <Reveal key={item.id} delay={i * 70}>
                <ActivityCard activity={item} />
              </Reveal>
            ))}
          </div>
        </section>
      ) : null}

      {/* ---------------- Mobile booking bar ---------------- */}
      <div className="safe-pb fixed inset-x-0 bottom-0 z-40 border-t border-mist-200 bg-white/95 px-4 pt-3 shadow-[0_-10px_30px_-15px_rgba(4,20,26,0.25)] backdrop-blur-md lg:hidden">
        <div className="mx-auto flex max-w-6xl items-center gap-3">
          <div className="min-w-0 flex-1">
            {price ? (
              <>
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-400">
                  {tr("from")}
                </p>
                <p className="font-display truncate text-lg font-bold text-ink-900 sm:text-xl">
                  {formatPrice(price.amount, price.currency, locale)}
                </p>
              </>
            ) : (
              <p className="text-sm font-semibold text-ink-500">
                {tr("priceOnRequest")}
              </p>
            )}
          </div>
          <ReserveButton
            activityName={name}
            activityPath={path}
            className="min-w-0 shrink-0 px-4 sm:px-6"
          />
        </div>
      </div>

      {lightboxIndex !== null ? (
        <Lightbox
          images={images}
          index={lightboxIndex}
          alt={name}
          onClose={() => setLightboxIndex(null)}
          onIndexChange={setLightboxIndex}
        />
      ) : null}
    </div>
  );
}

function PriceRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="text-ink-500">{label}</dt>
      <dd className="font-semibold text-ink-900">{value}</dd>
    </div>
  );
}
