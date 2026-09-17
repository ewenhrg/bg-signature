/**
 * ONE-SHOT migration helper only.
 * Reads credentials from the legacy project .env to export activities,
 * then writes a local JSON snapshot. Never imported by the BG Signature app.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const legacyEnvPath = path.resolve(
  __dirname,
  "../../hurghada-dream-intranet/.env"
);
const outPath = path.resolve(__dirname, "_live_export.json");

function loadEnv(filePath) {
  const env = {};
  for (const line of fs.readFileSync(filePath, "utf8").split(/\r?\n/)) {
    if (!line || line.startsWith("#") || !line.includes("=")) continue;
    const i = line.indexOf("=");
    const k = line.slice(0, i).trim();
    let v = line.slice(i + 1).trim();
    if (
      (v.startsWith('"') && v.endsWith('"')) ||
      (v.startsWith("'") && v.endsWith("'"))
    ) {
      v = v.slice(1, -1);
    }
    env[k] = v;
  }
  return env;
}

const env = loadEnv(legacyEnvPath);
const url = env.VITE_SUPABASE_URL;
const key = env.VITE_SUPABASE_ANON_KEY;
const site = env.VITE_SITE_KEY || "hurghada_dream_0606";

if (!url || !key) {
  console.error("Missing Supabase credentials in legacy .env");
  process.exit(1);
}

const endpoint =
  `${url}/rest/v1/activities?site_key=eq.${encodeURIComponent(site)}` +
  `&select=*&order=name`;

const res = await fetch(endpoint, {
  headers: {
    apikey: key,
    Authorization: `Bearer ${key}`,
  },
});

console.log("status", res.status);
const data = await res.json();
if (!Array.isArray(data)) {
  console.error(data);
  process.exit(1);
}

const withImg = data.filter(
  (a) => Array.isArray(a.catalog_image_urls) && a.catalog_image_urls.length
).length;
const withDesc = data.filter(
  (a) => a.description && String(a.description).trim()
).length;

console.log({ count: data.length, withImg, withDesc });
fs.writeFileSync(
  outPath,
  JSON.stringify(
    { exportedAt: new Date().toISOString(), site_key: site, count: data.length, activities: data },
    null,
    2
  )
);
console.log("wrote", outPath);
