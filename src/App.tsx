import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import { LocaleProvider } from "@/context/LocaleContext";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ScrollManager } from "@/components/ScrollManager";
import { HomePage } from "@/pages/HomePage";
import { CataloguePage } from "@/pages/CataloguePage";
import { ActivityPage } from "@/pages/ActivityPage";
import { ContactPage } from "@/pages/ContactPage";
import { useLocale } from "@/context/LocaleContext";
import { useEffect } from "react";
import { pickLocalized } from "@/lib/i18n";
import { getActivityBySlug, siteConfig } from "@/lib/catalogue";
import { useParams } from "react-router-dom";
import { AdminAuthProvider } from "@/admin/AdminAuthContext";
import { AdminLoginPage } from "@/pages/admin/AdminLoginPage";
import { AdminLayout } from "@/pages/admin/AdminLayout";
import { AdminActivitiesPage } from "@/pages/admin/AdminActivitiesPage";
import { AdminActivityEditPage } from "@/pages/admin/AdminActivityEditPage";
import { AdminSitePage } from "@/pages/admin/AdminSitePage";

function Layout() {
  return (
    <div className="flex min-h-screen flex-col">
      <ScrollManager />
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

function DocumentTitle({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  useEffect(() => {
    document.title = title;
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.setAttribute("name", "description");
      document.head.appendChild(meta);
    }
    if (description) meta.setAttribute("content", description);
  }, [title, description]);
  return null;
}

function HomeRoute() {
  const { locale, tr } = useLocale();
  return (
    <>
      <DocumentTitle
        title={`${siteConfig.brand} — ${tr("navHome")}`}
        description={siteConfig.tagline[locale]}
      />
      <HomePage />
    </>
  );
}

function CatalogueRoute() {
  const { tr } = useLocale();
  return (
    <>
      <DocumentTitle
        title={`${tr("catalogueTitle")} | ${siteConfig.brand}`}
        description={tr("catalogueSub")}
      />
      <CataloguePage />
    </>
  );
}

function ActivityRoute() {
  const { locale, tr } = useLocale();
  const { slug = "" } = useParams();
  const activity = getActivityBySlug(slug);
  const name = activity ? pickLocalized(activity.name, locale) : tr("noResults");
  return (
    <>
      <DocumentTitle
        title={`${name} | ${siteConfig.brand}`}
        description={
          activity
            ? pickLocalized(activity.description, locale).slice(0, 160) ||
              tr("catalogueSub")
            : tr("catalogueSub")
        }
      />
      <ActivityPage />
    </>
  );
}

function ContactRoute() {
  const { tr } = useLocale();
  return (
    <>
      <DocumentTitle
        title={`${tr("contactTitle")} | ${siteConfig.brand}`}
        description={tr("contactSub")}
      />
      <ContactPage />
    </>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/fr" replace />} />
      <Route
        path="/admin"
        element={
          <AdminAuthProvider>
            <Outlet />
          </AdminAuthProvider>
        }
      >
        <Route index element={<Navigate to="activities" replace />} />
        <Route path="login" element={<AdminLoginPage />} />
        <Route element={<AdminLayout />}>
          <Route path="activities" element={<AdminActivitiesPage />} />
          <Route path="activities/:id" element={<AdminActivityEditPage />} />
          <Route path="site" element={<AdminSitePage />} />
        </Route>
      </Route>
      <Route
        path="/:locale"
        element={
          <LocaleProvider>
            <Layout />
          </LocaleProvider>
        }
      >
        <Route index element={<HomeRoute />} />
        <Route path="catalogue" element={<CatalogueRoute />} />
        <Route path="catalogue/:slug" element={<ActivityRoute />} />
        <Route path="contact" element={<ContactRoute />} />
      </Route>
      <Route path="*" element={<Navigate to="/fr" replace />} />
    </Routes>
  );
}
