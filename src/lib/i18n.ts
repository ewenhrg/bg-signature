import type { Locale, LocalizedString } from "@/types";

export function pickLocalized(
  value: LocalizedString | string | undefined | null,
  locale: Locale
): string {
  if (!value) return "";
  if (typeof value === "string") return value;
  const primary = value[locale]?.trim();
  if (primary) return primary;
  return value.fr?.trim() || value.bg?.trim() || "";
}

export function formatPrice(amount: number, currency = "EUR", locale: Locale = "fr") {
  if (!Number.isFinite(amount) || amount <= 0) return "";
  try {
    return new Intl.NumberFormat(locale === "bg" ? "bg-BG" : "fr-FR", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${Math.round(amount)} ${currency}`;
  }
}

export function fromPrice(activity: {
  priceAdult: number;
  priceChild: number;
  currency: string;
}) {
  // Always prefer the adult tariff for the public "from" price.
  if (activity.priceAdult > 0) {
    return { amount: activity.priceAdult, currency: activity.currency || "EUR" };
  }
  if (activity.priceChild > 0) {
    return { amount: activity.priceChild, currency: activity.currency || "EUR" };
  }
  return null;
}
