import { NavLink, Navigate, Outlet } from "react-router-dom";
import { useAdminAuth } from "@/admin/AdminAuthContext";

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `rounded-lg px-3 py-2 text-sm font-medium transition ${
    isActive
      ? "bg-sea-600 text-white"
      : "text-ink-700 hover:bg-sand-100"
  }`;

export function AdminLayout() {
  const { ready, authenticated, logout } = useAdminAuth();

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center text-ink-500">
        Chargement…
      </div>
    );
  }

  if (!authenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  return (
    <div className="min-h-screen bg-sand-50/80">
      <header className="border-b border-sand-200 bg-white/90">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <div>
            <p className="text-xs uppercase tracking-wide text-sea-600">Admin</p>
            <h1 className="text-lg font-semibold text-ink-900">BG Signature</h1>
          </div>
          <nav className="flex flex-wrap items-center gap-2">
            <NavLink to="/admin/activities" className={linkClass}>
              Activités
            </NavLink>
            <NavLink to="/admin/site" className={linkClass}>
              Site
            </NavLink>
            <a
              href="/fr/catalogue"
              target="_blank"
              rel="noreferrer"
              className="rounded-lg px-3 py-2 text-sm text-ink-500 hover:bg-sand-100"
            >
              Voir le site
            </a>
            <button
              type="button"
              onClick={logout}
              className="rounded-lg px-3 py-2 text-sm text-coral-600 hover:bg-sand-100"
            >
              Déconnexion
            </button>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
