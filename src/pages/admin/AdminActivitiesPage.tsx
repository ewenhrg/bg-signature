import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  createAdminActivity,
  deleteAdminActivity,
  fetchAdminActivities,
  fetchAdminCategories,
  updateAdminActivity,
} from "@/admin/api";
import type { Activity, Category } from "@/types";

export function AdminActivitiesPage() {
  const navigate = useNavigate();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const [acts, cats] = await Promise.all([
        fetchAdminActivities(),
        fetchAdminCategories(),
      ]);
      setActivities(acts.activities || []);
      setCategories(cats.categories || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur de chargement");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return activities.filter((a) => {
      if (category !== "all" && a.category !== category) return false;
      if (!q) return true;
      return (
        a.name.fr.toLowerCase().includes(q) ||
        a.name.bg.toLowerCase().includes(q) ||
        a.slug.toLowerCase().includes(q)
      );
    });
  }, [activities, query, category]);

  async function onCreate() {
    setCreating(true);
    setError("");
    try {
      const created = await createAdminActivity({
        name: { fr: "Nouvelle activité", bg: "" },
        description: { fr: "", bg: "" },
        notes: { fr: "", bg: "" },
        category: categories[0]?.key || "desert",
        priceAdult: 0,
        priceChild: 0,
        priceBaby: 0,
        currency: "EUR",
        availableDays: [true, true, true, true, true, true, true],
        images: [],
      });
      setActivities((prev) =>
        [...prev, created].sort((a, b) => a.name.fr.localeCompare(b.name.fr, "fr"))
      );
      navigate(`/admin/activities/${created.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Création impossible");
    } finally {
      setCreating(false);
    }
  }

  async function onDelete(id: string, name: string) {
    if (!window.confirm(`Supprimer « ${name} » ?`)) return;
    setError("");
    try {
      await deleteAdminActivity(id);
      setActivities((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Suppression impossible");
    }
  }

  async function quickSave(
    activity: Activity,
    patch: Partial<Pick<Activity, "category" | "priceAdult">>
  ) {
    setSavingId(activity.id);
    setError("");
    try {
      const saved = await updateAdminActivity(activity.id, {
        ...activity,
        ...patch,
      });
      setActivities((prev) =>
        prev.map((a) => (a.id === activity.id ? saved : a))
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Enregistrement impossible");
      await load();
    } finally {
      setSavingId(null);
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-ink-900">Activités</h2>
          <p className="text-sm text-ink-500">
            Cliquez sur <strong>Modifier</strong> pour changer prix, description et
            catégorie — ou éditez prix / catégorie directement ici.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void onCreate()}
          disabled={creating}
          className="rounded-lg bg-sea-600 px-4 py-2 text-sm font-medium text-white hover:bg-sea-500 disabled:opacity-60"
        >
          {creating ? "Création…" : "+ Nouvelle activité"}
        </button>
      </div>

      <div className="flex flex-wrap gap-3">
        <input
          type="search"
          placeholder="Rechercher…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="min-w-[220px] flex-1 rounded-lg border border-sand-200 bg-white px-3 py-2 text-sm outline-none ring-sea-400 focus:ring-2"
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="rounded-lg border border-sand-200 bg-white px-3 py-2 text-sm"
        >
          <option value="all">Toutes les catégories</option>
          {categories.map((c) => (
            <option key={c.key} value={c.key}>
              {c.label.fr}
            </option>
          ))}
        </select>
      </div>

      {error ? (
        <p className="text-sm text-coral-600" role="alert">
          {error}
        </p>
      ) : null}

      {loading ? (
        <p className="text-sm text-ink-500">Chargement…</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-sand-200 bg-white">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-sand-200 bg-sand-50 text-ink-500">
              <tr>
                <th className="px-3 py-2 font-medium">Nom</th>
                <th className="px-3 py-2 font-medium">Catégorie</th>
                <th className="px-3 py-2 font-medium">Prix adulte</th>
                <th className="px-3 py-2 font-medium">Statut</th>
                <th className="px-3 py-2 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((a) => (
                <tr key={a.id} className="border-b border-sand-100 last:border-0">
                  <td className="px-3 py-2">
                    <Link
                      to={`/admin/activities/${a.id}`}
                      className="font-medium text-sea-600 hover:underline"
                    >
                      {a.name.fr || "(sans nom)"}
                    </Link>
                    {a.name.bg ? (
                      <p className="text-xs text-ink-500">{a.name.bg}</p>
                    ) : null}
                  </td>
                  <td className="px-3 py-2">
                    <select
                      className="max-w-[160px] rounded border border-sand-200 bg-white px-2 py-1.5 text-xs"
                      value={a.category}
                      disabled={savingId === a.id}
                      onChange={(e) =>
                        void quickSave(a, { category: e.target.value })
                      }
                    >
                      {categories.map((c) => (
                        <option key={c.key} value={c.key}>
                          {c.label.fr}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        min={0}
                        step={1}
                        className="w-20 rounded border border-sand-200 px-2 py-1.5 text-xs font-semibold"
                        defaultValue={a.priceAdult}
                        key={`${a.id}-${a.priceAdult}`}
                        disabled={savingId === a.id}
                        onBlur={(e) => {
                          const next = Number(e.target.value);
                          if (!Number.isFinite(next) || next === a.priceAdult) return;
                          void quickSave(a, { priceAdult: Math.max(0, next) });
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            (e.target as HTMLInputElement).blur();
                          }
                        }}
                      />
                      <span className="text-xs text-ink-500">{a.currency}</span>
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <span
                      className={`inline-block rounded-full px-2 py-0.5 text-xs ${
                        a.catalogPaused
                          ? "bg-sand-100 text-ink-500"
                          : "bg-sea-600/10 text-sea-600"
                      }`}
                    >
                      {a.catalogPaused ? "Pause" : "Visible"}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        to={`/admin/activities/${a.id}`}
                        className="rounded bg-sea-600 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-sea-500"
                      >
                        Modifier
                      </Link>
                      <button
                        type="button"
                        onClick={() => void onDelete(a.id, a.name.fr)}
                        className="text-xs text-coral-600 hover:underline"
                      >
                        Suppr.
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!filtered.length ? (
                <tr>
                  <td colSpan={5} className="px-3 py-8 text-center text-ink-500">
                    Aucune activité trouvée
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
