import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  deleteAdminImage,
  fetchAdminActivities,
  fetchAdminCategories,
  updateAdminActivity,
  uploadAdminImages,
} from "@/admin/api";
import type { Activity, Category } from "@/types";

const DAY_LABELS = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];

function emptyActivity(): Activity {
  return {
    id: "",
    slug: "",
    category: "desert",
    name: { fr: "", bg: "" },
    description: { fr: "", bg: "" },
    notes: { fr: "", bg: "" },
    priceAdult: 0,
    priceChild: 0,
    priceBaby: 0,
    ageChild: "",
    ageBaby: "",
    babiesForbidden: false,
    currency: "EUR",
    availableDays: [true, true, true, true, true, true, true],
    popular: false,
    catalogPaused: false,
    images: [],
  };
}

function parsePrice(value: string): number {
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 ? n : 0;
}

export function AdminActivityEditPage() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const [activity, setActivity] = useState<Activity>(emptyActivity());
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const [acts, cats] = await Promise.all([
          fetchAdminActivities(),
          fetchAdminCategories(),
        ]);
        if (cancelled) return;
        setCategories(cats.categories || []);
        const found = (acts.activities || []).find((a) => a.id === id);
        if (!found) {
          setError("Activité introuvable");
        } else {
          setActivity({
            ...emptyActivity(),
            ...found,
            name: { fr: found.name?.fr || "", bg: found.name?.bg || "" },
            description: {
              fr: found.description?.fr || "",
              bg: found.description?.bg || "",
            },
            notes: { fr: found.notes?.fr || "", bg: found.notes?.bg || "" },
          });
        }
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
  }, [id]);

  function patch<K extends keyof Activity>(key: K, value: Activity[K]) {
    setActivity((prev) => ({ ...prev, [key]: value }));
    setMessage("");
  }

  async function onSave(e?: FormEvent) {
    e?.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");
    try {
      const saved = await updateAdminActivity(id, activity);
      setActivity(saved);
      setMessage("Enregistré — rechargez le site public pour voir les changements");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Enregistrement impossible");
    } finally {
      setSaving(false);
    }
  }

  async function onUpload(files: FileList | null) {
    if (!files?.length) return;
    setUploading(true);
    setError("");
    setMessage("");
    try {
      const updated = await uploadAdminImages(id, files);
      setActivity(updated);
      setMessage("Photos ajoutées");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload impossible");
    } finally {
      setUploading(false);
    }
  }

  async function onRemoveImage(path: string) {
    if (!window.confirm("Supprimer cette photo ?")) return;
    setError("");
    try {
      const updated = await deleteAdminImage(id, path);
      setActivity(updated);
      setMessage("Photo supprimée");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Suppression impossible");
    }
  }

  if (loading) {
    return <p className="text-sm text-ink-500">Chargement…</p>;
  }

  if (!activity.id && error) {
    return (
      <div className="space-y-3">
        <p className="text-coral-600">{error}</p>
        <Link to="/admin/activities" className="text-sea-600 hover:underline">
          ← Retour
        </Link>
      </div>
    );
  }

  return (
    <form className="space-y-6 pb-24" onSubmit={onSave}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link to="/admin/activities" className="text-sm text-sea-600 hover:underline">
            ← Activités
          </Link>
          <h2 className="mt-1 text-xl font-semibold text-ink-900">
            Modifier : {activity.name.fr || "activité"}
          </h2>
          <p className="text-xs text-ink-500">
            Prix, description et catégorie — puis Enregistrer
          </p>
        </div>
        <div className="flex items-center gap-2">
          {message ? (
            <span className="max-w-xs text-right text-sm text-sea-600">{message}</span>
          ) : null}
          <button
            type="button"
            onClick={() => navigate(`/fr/catalogue/${activity.slug}`)}
            className="rounded-lg border border-sand-200 bg-white px-3 py-2 text-sm"
          >
            Aperçu
          </button>
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

      {/* 1. Catégorie */}
      <section className="rounded-xl border-2 border-sea-600/30 bg-white p-4 md:p-5">
        <h3 className="text-sm font-bold uppercase tracking-wide text-sea-600">
          1. Catégorie
        </h3>
        <label className="mt-3 block text-sm font-medium text-ink-700">
          Choisir la catégorie
          <select
            className="mt-1 w-full rounded-lg border border-sand-200 bg-white px-3 py-2.5 text-base"
            value={activity.category}
            onChange={(e) => patch("category", e.target.value)}
          >
            {categories.length === 0 ? (
              <option value={activity.category}>{activity.category}</option>
            ) : (
              categories.map((c) => (
                <option key={c.key} value={c.key}>
                  {c.label.fr}
                </option>
              ))
            )}
          </select>
        </label>
      </section>

      {/* 2. Prix */}
      <section className="rounded-xl border-2 border-sea-600/30 bg-white p-4 md:p-5">
        <h3 className="text-sm font-bold uppercase tracking-wide text-sea-600">
          2. Prix
        </h3>
        <div className="mt-3 grid gap-4 sm:grid-cols-2 md:grid-cols-4">
          <label className="block text-sm font-medium text-ink-700">
            Prix adulte (€)
            <input
              type="number"
              min={0}
              step={1}
              inputMode="decimal"
              className="mt-1 w-full rounded-lg border border-sand-200 px-3 py-2.5 text-base font-semibold"
              value={activity.priceAdult}
              onChange={(e) => patch("priceAdult", parsePrice(e.target.value))}
            />
          </label>
          <label className="block text-sm font-medium text-ink-700">
            Prix enfant (€)
            <input
              type="number"
              min={0}
              step={1}
              inputMode="decimal"
              className="mt-1 w-full rounded-lg border border-sand-200 px-3 py-2.5 text-base"
              value={activity.priceChild}
              onChange={(e) => patch("priceChild", parsePrice(e.target.value))}
            />
          </label>
          <label className="block text-sm font-medium text-ink-700">
            Prix bébé (€)
            <input
              type="number"
              min={0}
              step={1}
              inputMode="decimal"
              className="mt-1 w-full rounded-lg border border-sand-200 px-3 py-2.5 text-base"
              value={activity.priceBaby}
              onChange={(e) => patch("priceBaby", parsePrice(e.target.value))}
            />
          </label>
          <label className="block text-sm font-medium text-ink-700">
            Devise
            <input
              className="mt-1 w-full rounded-lg border border-sand-200 px-3 py-2.5 text-base"
              value={activity.currency}
              onChange={(e) => patch("currency", e.target.value)}
            />
          </label>
          <label className="block text-sm font-medium text-ink-700">
            Âge enfant
            <input
              className="mt-1 w-full rounded-lg border border-sand-200 px-3 py-2.5"
              value={activity.ageChild}
              onChange={(e) => patch("ageChild", e.target.value)}
              placeholder="ex. 5-10ans"
            />
          </label>
          <label className="block text-sm font-medium text-ink-700">
            Âge bébé
            <input
              className="mt-1 w-full rounded-lg border border-sand-200 px-3 py-2.5"
              value={activity.ageBaby}
              onChange={(e) => patch("ageBaby", e.target.value)}
              placeholder="ex. 0-5ans"
            />
          </label>
        </div>
        <p className="mt-2 text-xs text-ink-500">
          Mettez 0 si le tarif n’existe pas / sur demande pour ce type.
        </p>
      </section>

      {/* 3. Description */}
      <section className="rounded-xl border-2 border-sea-600/30 bg-white p-4 md:p-5">
        <h3 className="text-sm font-bold uppercase tracking-wide text-sea-600">
          3. Description
        </h3>
        <label className="mt-3 block text-sm font-medium text-ink-700">
          Description (FR)
          <textarea
            rows={12}
            className="mt-1 w-full rounded-lg border border-sand-200 px-3 py-3 text-sm leading-relaxed"
            value={activity.description.fr}
            onChange={(e) =>
              patch("description", {
                ...activity.description,
                fr: e.target.value,
              })
            }
            placeholder="Texte affiché sur la fiche activité (français)…"
          />
        </label>
        <label className="mt-4 block text-sm font-medium text-ink-700">
          Description (BG)
          <textarea
            rows={8}
            className="mt-1 w-full rounded-lg border border-sand-200 px-3 py-3 text-sm leading-relaxed"
            value={activity.description.bg}
            onChange={(e) =>
              patch("description", {
                ...activity.description,
                bg: e.target.value,
              })
            }
            placeholder="Текст на български (sinon le FR s’affiche)…"
          />
        </label>
      </section>

      {/* Autres infos */}
      <section className="grid gap-4 rounded-xl border border-sand-200 bg-white p-4 md:grid-cols-2">
        <h3 className="text-sm font-bold uppercase tracking-wide text-ink-500 md:col-span-2">
          Autres infos
        </h3>
        <label className="block text-sm">
          Nom (FR) *
          <input
            required
            className="mt-1 w-full rounded-lg border border-sand-200 px-3 py-2"
            value={activity.name.fr}
            onChange={(e) =>
              patch("name", { ...activity.name, fr: e.target.value })
            }
          />
        </label>
        <label className="block text-sm">
          Nom (BG)
          <input
            className="mt-1 w-full rounded-lg border border-sand-200 px-3 py-2"
            value={activity.name.bg}
            onChange={(e) =>
              patch("name", { ...activity.name, bg: e.target.value })
            }
          />
        </label>
        <label className="block text-sm">
          Notes (FR)
          <textarea
            rows={3}
            className="mt-1 w-full rounded-lg border border-sand-200 px-3 py-2"
            value={activity.notes.fr}
            onChange={(e) =>
              patch("notes", { ...activity.notes, fr: e.target.value })
            }
          />
        </label>
        <label className="block text-sm">
          Notes (BG)
          <textarea
            rows={3}
            className="mt-1 w-full rounded-lg border border-sand-200 px-3 py-2"
            value={activity.notes.bg}
            onChange={(e) =>
              patch("notes", { ...activity.notes, bg: e.target.value })
            }
          />
        </label>
        <div className="flex flex-wrap gap-4 md:col-span-2">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={activity.popular}
              onChange={(e) => patch("popular", e.target.checked)}
            />
            Populaire
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={activity.catalogPaused}
              onChange={(e) => patch("catalogPaused", e.target.checked)}
            />
            Masquer du catalogue
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={activity.babiesForbidden}
              onChange={(e) => patch("babiesForbidden", e.target.checked)}
            />
            Bébés interdits
          </label>
        </div>
      </section>

      <section className="rounded-xl border border-sand-200 bg-white p-4">
        <p className="mb-3 text-sm font-medium text-ink-700">Jours disponibles</p>
        <div className="flex flex-wrap gap-2">
          {DAY_LABELS.map((label, i) => (
            <label
              key={label}
              className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm ${
                activity.availableDays[i]
                  ? "border-sea-600 bg-sea-600/10 text-sea-600"
                  : "border-sand-200 text-ink-500"
              }`}
            >
              <input
                type="checkbox"
                className="sr-only"
                checked={Boolean(activity.availableDays[i])}
                onChange={(e) => {
                  const next = [...activity.availableDays];
                  next[i] = e.target.checked;
                  patch("availableDays", next);
                }}
              />
              {label}
            </label>
          ))}
        </div>
      </section>

      <section className="space-y-3 rounded-xl border border-sand-200 bg-white p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="font-medium text-ink-900">Photos</h3>
            <p className="text-xs text-ink-500">Jusqu’à 12 images — JPG, PNG, WEBP</p>
          </div>
          <label className="cursor-pointer rounded-lg bg-sand-100 px-3 py-2 text-sm hover:bg-sand-200">
            {uploading ? "Upload…" : "Ajouter des photos"}
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              disabled={uploading}
              onChange={(e) => {
                void onUpload(e.target.files);
                e.target.value = "";
              }}
            />
          </label>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {(activity.images || []).map((src) => (
            <div
              key={src}
              className="group relative overflow-hidden rounded-lg border border-sand-200"
            >
              <img src={src} alt="" className="aspect-[4/3] w-full object-cover" />
              <button
                type="button"
                onClick={() => void onRemoveImage(src)}
                className="absolute right-1 top-1 rounded bg-black/70 px-2 py-1 text-xs text-white opacity-0 transition group-hover:opacity-100"
              >
                Suppr.
              </button>
            </div>
          ))}
          {!activity.images?.length ? (
            <p className="col-span-full text-sm text-ink-500">Aucune photo</p>
          ) : null}
        </div>
      </section>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-sand-200 bg-white/95 px-4 py-3 backdrop-blur md:static md:border-0 md:bg-transparent md:p-0 md:backdrop-blur-none">
        <div className="mx-auto flex max-w-6xl justify-end gap-3">
          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-lg bg-sea-600 px-4 py-3 text-sm font-medium text-white hover:bg-sea-500 disabled:opacity-60 md:w-auto md:py-2"
          >
            {saving ? "Enregistrement…" : "Enregistrer prix / description / catégorie"}
          </button>
        </div>
      </div>
    </form>
  );
}
