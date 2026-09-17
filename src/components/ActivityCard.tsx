import { Link } from "react-router-dom";
import type { Activity } from "@/types";
import { useLocale } from "@/context/LocaleContext";
import { formatPrice, fromPrice, pickLocalized } from "@/lib/i18n";
import { getCategoryLabel } from "@/lib/catalogue";

export function ActivityCard({ activity }: { activity: Activity }) {
  const { locale, tr } = useLocale();
  const name = pickLocalized(activity.name, locale);
  const price = fromPrice(activity);
  const img = activity.images?.[0];
  const to = `/${locale}/catalogue/${activity.slug}`;
  const photoCount = activity.images?.length || 0;

  return (
    <article className="card card-interactive group flex h-full flex-col overflow-hidden">
      <Link to={to} className="block" aria-label={name}>
        <div className="frame frame-card img-zoom">
          {img ? (
            <img
              src={img}
              alt={name}
              loading="lazy"
              decoding="async"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-lagoon-700 to-ink-900">
              <span className="font-display text-4xl font-bold text-white/25">
                {name.slice(0, 1).toUpperCase()}
              </span>
            </div>
          )}

          <div className="scrim-card opacity-70 transition-opacity duration-500 group-hover:opacity-90" />

          {activity.popular ? (
            <span className="badge-gold absolute left-3 top-3">{tr("popular")}</span>
          ) : null}

          {photoCount > 1 ? (
            <span className="absolute bottom-3 right-3 rounded-full bg-ink-950/60 px-2.5 py-1 text-[11px] font-semibold text-white/90 backdrop-blur-sm">
              {photoCount} {tr("photos")}
            </span>
          ) : null}
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-lagoon-600">
          {getCategoryLabel(activity.category, locale)}
        </p>

        <h3 className="font-display mt-2 line-clamp-2 text-lg font-semibold leading-snug text-ink-900 sm:text-xl">
          <Link to={to} className="transition-colors hover:text-lagoon-600">
            {name}
          </Link>
        </h3>

        <div className="mt-4 flex flex-col gap-3 border-t border-mist-100 pt-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            {price ? (
              <>
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-400">
                  {tr("from")}
                </p>
                <p className="font-display truncate text-xl font-bold text-ink-900 sm:text-2xl">
                  {formatPrice(price.amount, price.currency, locale)}
                </p>
              </>
            ) : (
              <p className="text-sm font-semibold text-ink-500">
                {tr("priceOnRequest")}
              </p>
            )}
          </div>

          <Link to={to} className="btn btn-sm btn-lagoon w-full shrink-0 sm:w-auto">
            {tr("details")}
            <span aria-hidden>→</span>
          </Link>
        </div>
      </div>
    </article>
  );
}
