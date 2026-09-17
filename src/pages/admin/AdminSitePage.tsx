import { useEffect, useState, type FormEvent } from "react";
import { fetchAdminActivities, fetchAdminSite, saveAdminSite } from "@/admin/api";
import type { Activity, SiteConfig } from "@/types";

const emptySite: SiteConfig = {
  brand: "",
  tagline: { fr: "", bg: "" },
  whatsappNumber: "",
  email: "",
  address: "",
  instagram: "",
  facebook: "",
  heroImage: "",
  defaultLocale: "fr",
  locales: ["fr", "bg"],
};

type PhotoOption = { activity: string; src: string };

export function AdminSitePage() {
  const [site, setSite] = useState<SiteConfig>(emptySite);
  const [photos, setPhotos] = useState<PhotoOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await fetchAdminSite();
        if (!cancelled) setSite(data);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Erreur de chargement");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = (await fetchAdminActivities()) as { activities: Activity[] };
        if (cancelled) return;
        const options = (data.activities || []).flatMap((a) =>
          (a.images || []).map((src) => ({ activity: a.name.fr, src }))
        );
        setPhotos(options);
      } catch {
        // The hero field still works as a free-text path without this list.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function onSave(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");
    try {
      const saved = await saveAdminSite(site);
      setSite(saved);
      setMessage("Paramètres enregistrés");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Enregistrement impossible");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <p className="text-sm text-ink-500">Chargement…</p>;
  }

  return (
    <form className="space-y-5" onSubmit={onSave}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-ink-900">Paramètres du site</h2>
          <p className="text-sm text-ink-500">
            Marque, contacts, WhatsApp — visibles sur le site public
          </p>
        </div>
        <div className="flex items-center gap-2">
          {message ? <span className="text-sm text-sea-600">{message}</span> : null}
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-sea-600 px-4 py-2 text-sm font-medium text-white hover:bg-sea-500 disabled:opacity-60"
          >
            {saving ? "Enregistrement…" : "Enregistrer"}
          </button>
        </div>
      </div>

      {error ? (
        <p className="text-sm text-coral-600" role="alert">
          {error}
        </p>
      ) : null}

      <section className="grid gap-4 rounded-xl border border-sand-200 bg-white p-4 md:grid-cols-2">
        <label className="block text-sm md:col-span-2">
          Nom de la marque
          <input
            className="mt-1 w-full rounded-lg border border-sand-200 px-3 py-2"
            value={site.brand}
            onChange={(e) => setSite({ ...site, brand: e.target.value })}
          />
        </label>
        <label className="block text-sm">
          Slogan (FR)
          <input
            className="mt-1 w-full rounded-lg border border-sand-200 px-3 py-2"
            value={site.tagline.fr}
            onChange={(e) =>
              setSite({
                ...site,
                tagline: { ...site.tagline, fr: e.target.value },
              })
            }
          />
        </label>
        <label className="block text-sm">
          Slogan (BG)
          <input
            className="mt-1 w-full rounded-lg border border-sand-200 px-3 py-2"
            value={site.tagline.bg}
            onChange={(e) =>
              setSite({
                ...site,
                tagline: { ...site.tagline, bg: e.target.value },
              })
            }
          />
        </label>
        <label className="block text-sm">
          WhatsApp (chiffres, ex. 336… )
          <input
            className="mt-1 w-full rounded-lg border border-sand-200 px-3 py-2"
            value={site.whatsappNumber}
            onChange={(e) =>
              setSite({ ...site, whatsappNumber: e.target.value })
            }
          />
        </label>
        <label className="block text-sm">
          Email
          <input
            type="email"
            className="mt-1 w-full rounded-lg border border-sand-200 px-3 py-2"
            value={site.email}
            onChange={(e) => setSite({ ...site, email: e.target.value })}
          />
        </label>
        <label className="block text-sm md:col-span-2">
          Adresse
          <input
            className="mt-1 w-full rounded-lg border border-sand-200 px-3 py-2"
            value={site.address}
            onChange={(e) => setSite({ ...site, address: e.target.value })}
          />
        </label>
        <label className="block text-sm">
          Instagram (URL)
          <input
            className="mt-1 w-full rounded-lg border border-sand-200 px-3 py-2"
            value={site.instagram}
            onChange={(e) => setSite({ ...site, instagram: e.target.value })}
          />
        </label>
        <label className="block text-sm">
          Facebook (URL)
          <input
            className="mt-1 w-full rounded-lg border border-sand-200 px-3 py-2"
            value={site.facebook}
            onChange={(e) => setSite({ ...site, facebook: e.target.value })}
          />
        </label>
      </section>

      <section className="rounded-xl border border-sand-200 bg-white p-4">
        <h3 className="text-sm font-semibold text-ink-900">
          Photo de couverture (accueil)
        </h3>
        <p className="mt-1 text-xs text-ink-500">
          Grande photo affichée en haut de la page d’accueil. Choisissez une photo
          large et lumineuse. Laissez vide pour une sélection automatique.
        </p>

        <div className="mt-3 grid gap-4 md:grid-cols-[1fr_16rem]">
          <div className="space-y-2">
            <select
              className="w-full rounded-lg border border-sand-200 px-3 py-2 text-sm"
              value={site.heroImage || ""}
              onChange={(e) => setSite({ ...site, heroImage: e.target.value })}
            >
              <option value="">— Sélection automatique —</option>
              {photos.map((p) => (
                <option key={p.src} value={p.src}>
                  {p.activity} — {p.src.split("/").pop()}
                </option>
              ))}
            </select>

            <input
              className="w-full rounded-lg border border-sand-200 px-3 py-2 text-sm"
              placeholder="/images/activities/…/01.jpg"
              value={site.heroImage || ""}
              onChange={(e) => setSite({ ...site, heroImage: e.target.value })}
            />
          </div>

          <div className="overflow-hidden rounded-lg border border-sand-200 bg-sand-50">
            {site.heroImage ? (
              <img
                src={site.heroImage}
                alt="Aperçu de la couverture"
                className="aspect-[16/9] w-full object-cover"
              />
            ) : (
              <div className="flex aspect-[16/9] items-center justify-center text-xs text-ink-500">
                Aucun aperçu
              </div>
            )}
          </div>
        </div>
      </section>

      <p className="text-xs text-ink-500">
        Note : le numéro WhatsApp dans <code>.env</code> (
        <code>VITE_WHATSAPP_NUMBER</code>) peut aussi être utilisé par le site.
        Les changements admin s’appliquent après rechargement des données JSON.
      </p>
    </form>
  );
}
