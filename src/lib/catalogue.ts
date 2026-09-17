import activitiesData from "@data/activities.json";
import categoriesData from "@data/categories.json";
import siteData from "@data/site.json";
import type { Activity, Category, Locale, SiteConfig } from "@/types";

export const siteConfig = siteData as SiteConfig;

export const categories = (categoriesData as { categories: Category[] }).categories;

export const activities = (activitiesData as { activities: Activity[] }).activities
  .filter((a) => !a.catalogPaused)
  .slice()
  .sort((a, b) => a.name.fr.localeCompare(b.name.fr, "fr"));

export function getActivityBySlug(slug: string): Activity | undefined {
  return activities.find((a) => a.slug === slug);
}

export function getCategoryLabel(key: string, locale: Locale): string {
  const cat = categories.find((c) => c.key === key);
  if (!cat) return key;
  return cat.label[locale] || cat.label.fr;
}

export function countByCategory(key: string): number {
  return activities.filter((a) => a.category === key).length;
}

/** First photo of the most representative activity in a category. */
export function getCategoryCover(key: string): string | undefined {
  const inCategory = activities.filter((a) => a.category === key && a.images?.[0]);
  const popular = inCategory.find((a) => a.popular);
  return (popular || inCategory[0])?.images[0];
}

/** Categories that actually have activities, richest first. */
export const activeCategories = categories
  .map((c) => ({ ...c, count: countByCategory(c.key), cover: getCategoryCover(c.key) }))
  .filter((c) => c.count > 0);

function hasUsableContent(activity: Activity): boolean {
  return Boolean(activity.images?.[0]) && activity.priceAdult > 0;
}

/** Highlighted activities for the homepage: popular first, then well-filled ones. */
export function getFeaturedActivities(limit = 6): Activity[] {
  const complete = activities.filter(hasUsableContent);
  const popular = complete.filter((a) => a.popular);
  const rest = complete.filter((a) => !a.popular);

  const spread: Activity[] = [];
  const seenCategories = new Set<string>();

  // One per category first so the selection feels varied
  for (const activity of rest) {
    if (seenCategories.has(activity.category)) continue;
    seenCategories.add(activity.category);
    spread.push(activity);
  }

  return [...popular, ...spread, ...rest]
    .filter((a, i, arr) => arr.findIndex((x) => x.id === a.id) === i)
    .slice(0, limit);
}

/**
 * Banner images, sea first: the brand is Red Sea, so a water shot reads better
 * than a transfer van. Returns distinct photos so banners never repeat.
 * The homepage banner can be pinned from the admin via siteConfig.heroImage.
 */
export function getHeroImages(count = 1): string[] {
  const pool = activities.filter((a) => a.images?.[0]);
  const candidates = [
    siteConfig.heroImage,
    ...pool.filter((a) => a.category === "aquatique" && a.popular).map(firstImage),
    ...pool.filter((a) => a.category === "aquatique").map(firstImage),
    ...pool.filter((a) => a.category === "desert" && a.popular).map(firstImage),
    ...pool.filter((a) => a.category === "desert").map(firstImage),
    ...pool.map(firstImage),
  ];

  const out: string[] = [];
  for (const src of candidates) {
    if (!src || out.includes(src)) continue;
    out.push(src);
    if (out.length >= count) break;
  }
  return out;
}

function firstImage(activity: Activity): string {
  return activity.images[0];
}
