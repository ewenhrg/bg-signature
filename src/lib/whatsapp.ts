import site from "@data/site.json";
import type { Locale } from "@/types";

/** WhatsApp number: env overrides site.json. Digits only preferred. */
export function getWhatsAppNumber(): string {
  const fromEnv = String(import.meta.env.VITE_WHATSAPP_NUMBER || "").trim();
  const fromSite = String(site.whatsappNumber || "").trim();
  const raw = fromEnv || fromSite;
  return raw.replace(/[^\d+]/g, "").replace(/^\+/, "");
}

export function buildWhatsAppReserveUrl(opts: {
  locale: Locale;
  activityName: string;
  activityUrl?: string;
}): string | null {
  const number = getWhatsAppNumber();
  if (!number) return null;

  const name = opts.activityName.trim();
  let message =
    opts.locale === "bg"
      ? `Здравейте, бих искал/искала да резервирам активността: ${name}.`
      : `Bonjour, je souhaite réserver l'activité : ${name}.`;

  if (opts.activityUrl) {
    message += `\n${opts.activityUrl}`;
  }

  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}
