export type Locale = "fr" | "bg";

export type LocalizedString = {
  fr: string;
  bg: string;
};

export type Activity = {
  id: string;
  slug: string;
  category: string;
  name: LocalizedString;
  description: LocalizedString;
  notes: LocalizedString;
  priceAdult: number;
  priceChild: number;
  priceBaby: number;
  ageChild: string;
  ageBaby: string;
  babiesForbidden: boolean;
  currency: string;
  availableDays: boolean[];
  popular: boolean;
  catalogPaused: boolean;
  images: string[];
};

export type Category = {
  key: string;
  label: LocalizedString;
};

export type SiteConfig = {
  brand: string;
  tagline: LocalizedString;
  whatsappNumber: string;
  email: string;
  address: string;
  instagram: string;
  facebook: string;
  /** Homepage banner photo. Falls back to a catalogue photo when empty. */
  heroImage?: string;
  defaultLocale: Locale;
  locales: Locale[];
};
