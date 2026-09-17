import type { ReactNode } from "react";
import { useLocale } from "@/context/LocaleContext";
import { activities, siteConfig } from "@/lib/catalogue";
import { buildWhatsAppReserveUrl, getWhatsAppNumber } from "@/lib/whatsapp";
import { Reveal } from "@/components/Reveal";
import type { UiKey } from "@/i18n/ui";

const STEPS: { title: UiKey; text: UiKey }[] = [
  { title: "step1Title", text: "step1Text" },
  { title: "step2Title", text: "step2Text" },
  { title: "step3Title", text: "step3Text" },
];

export function ContactPage() {
  const { locale, tr } = useLocale();
  const number = getWhatsAppNumber();
  const href = number
    ? buildWhatsAppReserveUrl({
        locale,
        activityName:
          locale === "bg" ? "обща информация / запитване" : "demande d'information",
      })
    : null;

  return (
    <div>
      {/* ---------------- Header band ---------------- */}
      <section className="surface-deep relative overflow-hidden text-white">
        <div className="bg-noise pointer-events-none absolute inset-0 opacity-20" />
        <div
          aria-hidden
          className="pointer-events-none absolute -right-20 top-0 h-72 w-72 rounded-full bg-lagoon-500/20 blur-3xl"
        />

        <div className="shell relative pb-14 pt-28 md:pb-24 md:pt-36">
          <p className="eyebrow flex items-center gap-3 text-lagoon-300">
            <span className="h-px w-8 bg-lagoon-400/70" />
            WhatsApp
          </p>
          <h1 className="text-display-lg balance mt-4">{tr("contactTitle")}</h1>
          <p className="text-body-lg balance mt-4 max-w-xl text-white/75">
            {tr("contactSub")}
          </p>
        </div>
      </section>

      <div className="shell py-12 md:py-20">
        <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:gap-12">
          {/* Contact card */}
          <Reveal>
            <div className="card overflow-hidden">
              <div className="surface-deep px-6 py-8 text-white sm:px-8">
                <p className="eyebrow text-lagoon-300">{siteConfig.brand}</p>
                <p className="font-display mt-3 text-2xl font-semibold sm:text-3xl">
                  {siteConfig.tagline[locale] || siteConfig.tagline.fr}
                </p>
              </div>

              <div className="p-6 sm:p-8">
                <dl className="space-y-4 text-sm">
                  {siteConfig.email ? (
                    <InfoRow
                      label="Email"
                      value={
                        <a
                          href={`mailto:${siteConfig.email}`}
                          className="font-semibold text-lagoon-600 hover:underline"
                        >
                          {siteConfig.email}
                        </a>
                      }
                    />
                  ) : null}
                  {siteConfig.address ? (
                    <InfoRow
                      label={locale === "bg" ? "Адрес" : "Adresse"}
                      value={
                        <span className="font-semibold text-ink-900">
                          {siteConfig.address}
                        </span>
                      }
                    />
                  ) : null}
                  <InfoRow
                    label={locale === "bg" ? "Каталог" : "Catalogue"}
                    value={
                      <span className="font-semibold text-ink-900">
                        {activities.length} {tr("activities")}
                      </span>
                    }
                  />
                  <InfoRow
                    label={locale === "bg" ? "Езици" : "Langues"}
                    value={
                      <span className="font-semibold text-ink-900">
                        Français · Български
                      </span>
                    }
                  />
                </dl>

                <div className="mt-8 border-t border-mist-100 pt-6">
                  {number ? (
                    <a
                      href={href || "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-primary w-full"
                    >
                      {tr("openWhatsApp")}
                    </a>
                  ) : (
                    <p className="rounded-2xl border border-reef-500/30 bg-reef-500/8 px-4 py-3 text-sm leading-relaxed text-reef-600">
                      {tr("noWhatsApp")}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </Reveal>

          {/* Steps */}
          <Reveal delay={90}>
            <p className="eyebrow text-lagoon-600">{tr("stepsTitle")}</p>
            <h2 className="text-display-md balance mt-3 text-ink-900">
              {tr("stepsSub")}
            </h2>
            <div className="hairline-gold mt-5" />

            <ol className="mt-8 space-y-6">
              {STEPS.map((step, i) => (
                <li key={step.title} className="flex gap-4">
                  <span className="font-display flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-lagoon-200 bg-white text-sm font-bold text-lagoon-600 shadow-[0_8px_20px_-12px_rgba(5,110,127,0.6)]">
                    {i + 1}
                  </span>
                  <div>
                    <h3 className="text-display-sm text-ink-900">
                      {tr(step.title)}
                    </h3>
                    <p className="mt-1.5 text-[15px] leading-relaxed text-ink-500">
                      {tr(step.text)}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </Reveal>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-mist-100 pb-4 last:border-0 last:pb-0">
      <dt className="text-[11px] font-bold uppercase tracking-[0.16em] text-ink-400">
        {label}
      </dt>
      <dd>{value}</dd>
    </div>
  );
}
