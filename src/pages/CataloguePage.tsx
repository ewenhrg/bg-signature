import { useMemo, useState } from "react";
import { useLocale } from "@/context/LocaleContext";
import { activities, categories } from "@/lib/catalogue";
import { pickLocalized } from "@/lib/i18n";
import { ActivityCard } from "@/components/ActivityCard";
import { Reveal } from "@/components/Reveal";
import type { Activity, Category } from "@/types";

type CategoryGroup = Category & { items: Activity[] };

export function CataloguePage() {
  const { locale, tr } = useLocale();
  const [category, setCategory] = useState<string>("all");
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return activities.filter((a) => {
      if (category !== "all" && a.category !== category) return false;
      if (!needle) return true;
      const hay = [
        pickLocalized(a.name, locale),
        pickLocalized(a.description, locale),
        a.name.fr,
        a.name.bg,
      ]
        .join(" ")
        .toLowerCase();
      return hay.includes(needle);
    });
  }, [category, locale, q]);

  const grouped = useMemo((): CategoryGroup[] => {
    const buckets: Record<string, Activity[]> = {};
    for (const c of categories) buckets[c.key] = [];

    for (const activity of filtered) {
      const key = categories.some((c) => c.key === activity.category)
        ? activity.category
        : "desert";
      if (!buckets[key]) buckets[key] = [];
      buckets[key].push(activity);
    }

    return categories
      .map((c) => ({ ...c, items: buckets[c.key] || [] }))
      .filter((c) => c.items.length > 0);
  }, [filtered]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: activities.length };
    for (const c of categories) {
      counts[c.key] = activities.filter((a) => a.category === c.key).length;
    }
    return counts;
  }, []);

  return (
    <div>
      {/* ---------------- Header band ---------------- */}
      {/* Brand gradient rather than a photo: the band then never depends on how
          dark or oddly cropped the picked photo happens to be. */}
      <section className="surface-deep relative overflow-hidden text-white">
        <div className="bg-noise pointer-events-none absolute inset-0 opacity-20" />
        <div
          aria-hidden
          className="pointer-events-none absolute -right-20 top-0 h-72 w-72 rounded-full bg-lagoon-500/20 blur-3xl"
        />

        <div className="shell relative pb-14 pt-28 md:pb-24 md:pt-36">
          <p className="eyebrow flex items-center gap-3 text-lagoon-300">
            <span className="h-px w-8 bg-lagoon-400/70" />
            {tr("heroKicker")}
          </p>
          <h1 className="text-display-lg balance mt-4 max-w-3xl">
            {tr("catalogueTitle")}
          </h1>
          <p className="text-body-lg balance mt-4 max-w-xl text-white/75">
            {tr("catalogueSub")}
          </p>
        </div>
      </section>

      {/* ---------------- Filters ---------------- */}
      {/* sticky-under-header tracks --header-offset (header height + notch). */}
      <div className="sticky-under-header sticky z-30 border-b border-mist-200/80 bg-mist-50/92 backdrop-blur-xl">
        <div className="shell py-3.5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between lg:gap-5">
            <div className="scrollbar-hide -mx-1 flex snap-x snap-mandatory gap-2 overflow-x-auto px-1 py-0.5 lg:flex-wrap lg:overflow-visible">
              <button
                type="button"
                onClick={() => setCategory("all")}
                className={`pill snap-center shrink-0 ${
                  category === "all" ? "pill-active" : ""
                }`}
              >
                {tr("allCategories")}
                <span
                  className={
                    category === "all" ? "text-white/70" : "text-ink-400"
                  }
                >
                  {categoryCounts.all}
                </span>
              </button>
              {categories.map((c) => (
                <button
                  key={c.key}
                  type="button"
                  onClick={() => setCategory(c.key)}
                  className={`pill snap-center shrink-0 ${
                    category === c.key ? "pill-active" : ""
                  }`}
                >
                  {c.label[locale] || c.label.fr}
                  <span
                    className={
                      category === c.key ? "text-white/70" : "text-ink-400"
                    }
                  >
                    {categoryCounts[c.key] || 0}
                  </span>
                </button>
              ))}
            </div>

            <div className="relative w-full shrink-0 lg:max-w-xs">
              <span
                aria-hidden
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-400"
              >
                ⌕
              </span>
              <input
                type="search"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder={tr("searchPlaceholder")}
                className="min-h-11 w-full rounded-full border border-mist-200 bg-white pl-10 pr-4 text-sm text-ink-900 outline-none transition placeholder:text-ink-400 focus:border-lagoon-400 focus:ring-4 focus:ring-lagoon-400/15"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ---------------- Grid ---------------- */}
      <div className="shell py-10 md:py-16">
        {grouped.length === 0 ? (
          <div className="card mx-auto max-w-md p-10 text-center">
            <p className="font-display text-3xl text-mist-300">⌕</p>
            <p className="mt-3 text-ink-500">{tr("noResults")}</p>
            <button
              type="button"
              onClick={() => {
                setQ("");
                setCategory("all");
              }}
              className="btn btn-outline-dark btn-sm mt-6"
            >
              {tr("allCategories")}
            </button>
          </div>
        ) : (
          <div className="space-y-14 md:space-y-20">
            {grouped.map((group) => (
              <section
                key={group.key}
                id={`cat-${group.key}`}
                className="scroll-under-filters"
              >
                <Reveal className="mb-7 flex items-end justify-between gap-4">
                  <div className="min-w-0">
                    <p className="eyebrow text-lagoon-600">
                      {group.items.length}{" "}
                      {group.items.length > 1 ? tr("activities") : tr("activity")}
                    </p>
                    <h2 className="text-display-md mt-2 text-ink-900">
                      {group.label[locale] || group.label.fr}
                    </h2>
                    <div className="hairline-gold mt-4" />
                  </div>
                </Reveal>

                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {group.items.map((activity, i) => (
                    <Reveal key={activity.id} delay={(i % 3) * 70}>
                      <ActivityCard activity={activity} />
                    </Reveal>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
