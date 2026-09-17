import { useState, type FormEvent } from "react";
import { Navigate } from "react-router-dom";
import { useAdminAuth } from "@/admin/AdminAuthContext";

export function AdminLoginPage() {
  const { ready, authenticated, login } = useAdminAuth();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (ready && authenticated) {
    return <Navigate to="/admin/activities" replace />;
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(password);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Connexion impossible");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4">
      <div className="rounded-2xl border border-sand-200 bg-white/90 p-8 shadow-sm">
        <p className="text-sm font-medium uppercase tracking-wide text-sea-600">
          Administration
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-ink-900">BG Signature</h1>
        <p className="mt-2 text-sm text-ink-500">
          Connectez-vous pour gérer activités, photos, prix et paramètres du site.
        </p>
        <form className="mt-6 space-y-4" onSubmit={onSubmit}>
          <label className="block text-sm text-ink-700">
            Mot de passe
            <input
              type="password"
              autoComplete="current-password"
              className="mt-1 w-full rounded-lg border border-sand-200 bg-white px-3 py-2 outline-none ring-sea-400 focus:ring-2"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>
          {error ? (
            <p className="text-sm text-coral-600" role="alert">
              {error}
            </p>
          ) : null}
          <button
            type="submit"
            disabled={loading || !ready}
            className="w-full rounded-lg bg-sea-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-sea-500 disabled:opacity-60"
          >
            {loading ? "Connexion…" : "Se connecter"}
          </button>
        </form>
      </div>
    </div>
  );
}
