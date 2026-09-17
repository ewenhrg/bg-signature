import type { Activity, Category, SiteConfig } from "@/types";

const TOKEN_KEY = "bg-admin-token";

export function getAdminToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setAdminToken(token: string | null) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

async function api<T>(
  path: string,
  options: RequestInit = {},
  auth = true
): Promise<T> {
  const headers = new Headers(options.headers || {});
  if (!(options.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  if (auth) {
    const token = getAdminToken();
    if (token) headers.set("Authorization", `Bearer ${token}`);
  }

  const res = await fetch(path, { ...options, headers });
  const res = await fetch(path, { ...options, headers });
  const data = await res.json().catch(() => ({}));
  if (res.status === 401) {
    setAdminToken(null);
    throw new Error(
      typeof data?.error === "string" ? data.error : "Non autorisé"
    );
  }
  if (!res.ok) {
    throw new Error(
      typeof data?.error === "string" ? data.error : `Erreur ${res.status}`
    );
  }
  return data as T;
}

export type ActivitiesPayload = {
  importedAt?: string;
  source?: string;
  count: number;
  activities: Activity[];
};

export type CategoriesPayload = {
  categories: Category[];
};

export function loginAdmin(password: string) {
  return api<{ token: string }>(
    "/api/admin/login",
    { method: "POST", body: JSON.stringify({ password }) },
    false
  );
}

export function checkAdminSession() {
  return api<{ ok: boolean }>("/api/admin/me");
}

export function fetchAdminActivities() {
  return api<ActivitiesPayload>("/api/admin/activities");
}

export function fetchAdminCategories() {
  return api<CategoriesPayload>("/api/admin/categories");
}

export function fetchAdminSite() {
  return api<SiteConfig>("/api/admin/site");
}

export function saveAdminSite(site: Partial<SiteConfig>) {
  return api<SiteConfig>("/api/admin/site", {
    method: "PUT",
    body: JSON.stringify(site),
  });
}

export function createAdminActivity(activity: Partial<Activity>) {
  return api<Activity>("/api/admin/activities", {
    method: "POST",
    body: JSON.stringify(activity),
  });
}

export function updateAdminActivity(id: string, activity: Partial<Activity>) {
  return api<Activity>(`/api/admin/activities/${id}`, {
    method: "PUT",
    body: JSON.stringify(activity),
  });
}

export function deleteAdminActivity(id: string) {
  return api<{ ok: boolean }>(`/api/admin/activities/${id}`, {
    method: "DELETE",
  });
}

export function uploadAdminImages(id: string, files: FileList | File[]) {
  const form = new FormData();
  Array.from(files).forEach((file) => form.append("files", file));
  return api<Activity>(`/api/admin/activities/${id}/images`, {
    method: "POST",
    body: form,
  });
}

export function deleteAdminImage(id: string, imagePath: string) {
  return api<Activity>(`/api/admin/activities/${id}/images`, {
    method: "DELETE",
    body: JSON.stringify({ path: imagePath }),
  });
}
